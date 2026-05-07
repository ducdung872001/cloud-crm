import { db } from "../db/store.js";
import { getPlan } from "../config/plans.js";
import { mapLegacyPlanToTier } from "../middleware/quota.js";

/**
 * Financial P&L compute — admin dashboard.
 *
 * Hợp nhất:
 *   - Revenue: subscription * price (theo tier hiện tại + cycle)
 *   - Cost: db.usageLogs aggregate by provider/step
 *   - Margin = revenue - cost
 *   - MRR: subscription active normalized về monthly
 *   - Churn: subscriptions chuyển active → expired/canceled trong period
 *
 * Period filter dạng `YYYY-MM`. Default: tháng hiện tại.
 */

const USD_TO_VND = 25_000;

export interface ProviderBreakdown {
  /** Theo step trong usage_log: claude, whisper, per_student_breakdown, zalo_push, storage */
  step: string;
  /** Theo model id (claude-haiku-4-5, whisper-large-v3-turbo, ...) */
  model?: string;
  callCount: number;
  totalCostUSD: number;
  totalCostVND: number;
}

export interface TenantPnL {
  mentorId: string;
  tier: string;
  monthlyRevenueVND: number;
  monthlyCostUSD: number;
  monthlyCostVND: number;
  marginVND: number;
  marginPct: number;
  status: string;
}

export interface FinancialPnL {
  period: string;       // YYYY-MM
  /** Thời điểm compute */
  generatedAt: string;
  totals: {
    activeMentors: number;
    trialMentors: number;
    expiredMentors: number;
    /** MRR = sum(monthlyRevenueVND) qua tất cả active sub */
    mrrVND: number;
    arrVND: number;     // MRR * 12
    totalCostUSD: number;
    totalCostVND: number;
    grossMarginVND: number;
    grossMarginPct: number;
  };
  byProvider: ProviderBreakdown[];
  byTenant: TenantPnL[];
  churn: {
    /** Số sub chuyển sang expired/canceled trong period */
    churnedCount: number;
    /** Tỉ lệ churn (count / activeAtStart) */
    churnRatePct: number;
  };
}

export function computeFinancialPnL(period?: string): FinancialPnL {
  const targetPeriod = period ?? currentPeriod();
  const periodStart = new Date(`${targetPeriod}-01T00:00:00Z`);
  const periodEnd = new Date(periodStart); periodEnd.setMonth(periodEnd.getMonth() + 1);

  const subs = Array.from(db.subscriptions.values());

  // ── Revenue + tenant breakdown ──────────────────────────────────────────
  const byTenant: TenantPnL[] = [];
  let mrrVND = 0;
  let activeMentors = 0;
  let trialMentors = 0;
  let expiredMentors = 0;

  for (const sub of subs) {
    const tier = mapLegacyPlanToTier(sub.plan);
    let monthlyRevenueVND = 0;
    if (sub.status === "active") {
      activeMentors++;
      const plan = safePlan(tier);
      const monthly = plan?.monthlyPriceVND ?? 0;
      monthlyRevenueVND = monthly;
      mrrVND += monthly;
    } else if (sub.status === "trial") {
      trialMentors++;
    } else if (sub.status === "expired") {
      expiredMentors++;
    }

    const tenantLogs = db.usageLogs.filter((l) =>
      l.mentorId === sub.mentorId && new Date(l.createdAt) >= periodStart && new Date(l.createdAt) < periodEnd,
    );
    const monthlyCostUSD = tenantLogs.reduce((s, l) => s + l.costUSD, 0);
    const monthlyCostVND = monthlyCostUSD * USD_TO_VND;

    byTenant.push({
      mentorId: sub.mentorId,
      tier,
      monthlyRevenueVND,
      monthlyCostUSD,
      monthlyCostVND,
      marginVND: monthlyRevenueVND - monthlyCostVND,
      marginPct: monthlyRevenueVND > 0
        ? ((monthlyRevenueVND - monthlyCostVND) / monthlyRevenueVND) * 100
        : 0,
      status: sub.status,
    });
  }

  // ── Provider breakdown ───────────────────────────────────────────────────
  const periodLogs = db.usageLogs.filter((l) =>
    new Date(l.createdAt) >= periodStart && new Date(l.createdAt) < periodEnd,
  );
  const providerMap = new Map<string, ProviderBreakdown>();
  for (const log of periodLogs) {
    const key = `${log.step}::${log.model ?? "n/a"}`;
    const cur = providerMap.get(key) ?? {
      step: log.step,
      model: log.model,
      callCount: 0,
      totalCostUSD: 0,
      totalCostVND: 0,
    };
    cur.callCount++;
    cur.totalCostUSD += log.costUSD;
    cur.totalCostVND += log.costVND;
    providerMap.set(key, cur);
  }
  const byProvider = Array.from(providerMap.values()).sort((a, b) => b.totalCostUSD - a.totalCostUSD);
  const totalCostUSD = byProvider.reduce((s, p) => s + p.totalCostUSD, 0);

  // ── Churn ────────────────────────────────────────────────────────────────
  // Stub: count subs có status expired/canceled với updatedAt-ish trong period.
  // Production: lưu transition log riêng để tính chính xác.
  const churnedCount = subs.filter((s) =>
    (s.status === "expired" || s.status === "canceled_at_period_end")
    && s.currentPeriodEnd >= periodStart.toISOString()
    && s.currentPeriodEnd < periodEnd.toISOString(),
  ).length;
  const activeAtStart = activeMentors + churnedCount;
  const churnRatePct = activeAtStart > 0 ? (churnedCount / activeAtStart) * 100 : 0;

  return {
    period: targetPeriod,
    generatedAt: new Date().toISOString(),
    totals: {
      activeMentors,
      trialMentors,
      expiredMentors,
      mrrVND,
      arrVND: mrrVND * 12,
      totalCostUSD,
      totalCostVND: totalCostUSD * USD_TO_VND,
      grossMarginVND: mrrVND - totalCostUSD * USD_TO_VND,
      grossMarginPct: mrrVND > 0 ? ((mrrVND - totalCostUSD * USD_TO_VND) / mrrVND) * 100 : 0,
    },
    byProvider,
    byTenant: byTenant.sort((a, b) => b.monthlyRevenueVND - a.monthlyRevenueVND),
    churn: { churnedCount, churnRatePct },
  };
}

function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function safePlan(tier: string) {
  try { return getPlan(tier as never); } catch { return null; }
}
