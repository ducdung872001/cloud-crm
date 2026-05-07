import { db } from "../db/store.js";
import { getPlan, computeCyclePrice } from "../config/plans.js";
import type { TenantTier } from "../config/models.js";
import type { BillingCycle, Subscription, PlanId } from "../db/types.js";

/**
 * State machine + cron tick cho subscription.
 *
 * States: trial → active | expired
 *         active → canceled_at_period_end | past_due
 *         canceled_at_period_end → expired
 *         expired → (re-upgrade) → active
 *
 * Cron tick mỗi giờ (gọi từ jobs/subscription-cron.ts):
 *   1. Trial ended → expired → fallback "free" (không xoá tenant)
 *   2. Active period end + autoRenew=true → tạo invoice mới (chờ thanh toán)
 *   3. Active period end + autoRenew=false → expired → fallback "free"
 *   4. Reminder D-7 trước period end → fire event (TODO: notification service)
 *   5. Past_due quá 7 ngày → expired
 */

const CYCLE_MONTHS: Record<BillingCycle, number> = {
  monthly: 1, quarterly: 3, semiannual: 6, yearly: 12,
};

export interface LifecycleEvent {
  type:
    | "trial_expired"
    | "renewal_due"
    | "renewal_invoice_created"
    | "subscription_expired"
    | "reminder_d7"
    | "past_due_expired";
  mentorId: string;
  tenantId?: string;
  invoiceId?: string;
  /** Số ngày còn lại (cho reminder) hoặc số ngày past_due */
  days?: number;
  occurredAt: string;
}

const eventQueue: LifecycleEvent[] = [];

function emit(event: Omit<LifecycleEvent, "occurredAt">) {
  eventQueue.push({ ...event, occurredAt: new Date().toISOString() });
}

/** Lấy events đã emit. Caller (notification service) consume + clear. */
export function drainLifecycleEvents(): LifecycleEvent[] {
  const out = eventQueue.splice(0, eventQueue.length);
  return out;
}

/**
 * Upgrade subscription sau khi invoice paid (gọi từ vnpay webhook hoặc admin
 * mark-paid). Activate plan + period.
 */
export function upgradeSubscription(
  mentorId: string,
  tier: TenantTier,
  cycle: BillingCycle,
  paidAmountVND: number,
): Subscription | null {
  const sub = db.subscriptions.get(mentorId);
  if (!sub) return null;
  const months = CYCLE_MONTHS[cycle];
  const start = new Date();
  const end = new Date(start); end.setMonth(end.getMonth() + months);

  sub.plan = tier as PlanId; // legacy field — middleware sẽ map
  sub.status = "active";
  sub.cycle = cycle;
  sub.currentPeriodStart = start.toISOString();
  sub.currentPeriodEnd = end.toISOString();
  sub.nextBillingAt = end.toISOString();
  sub.nextBillingAmountVND = paidAmountVND;
  sub.autoRenew = true;
  sub.trialStartedAt = undefined;
  sub.trialEndsAt = undefined;
  return sub;
}

/**
 * Free-tier fallback: dùng khi trial expired hoặc subscription expired.
 * Reset usage counters, plan = "free", không có period end.
 */
export function fallbackToFree(mentorId: string): Subscription | null {
  const sub = db.subscriptions.get(mentorId);
  if (!sub) return null;
  const now = new Date();
  sub.plan = "free" as PlanId;
  sub.status = "expired";
  sub.cycle = "monthly";
  sub.currentPeriodStart = now.toISOString();
  // Free không có period end thực sự → đặt 100 năm sau cho UI dễ render
  const farFuture = new Date(now); farFuture.setFullYear(farFuture.getFullYear() + 100);
  sub.currentPeriodEnd = farFuture.toISOString();
  sub.nextBillingAt = null;
  sub.nextBillingAmountVND = undefined;
  sub.autoRenew = false;
  sub.trialStartedAt = undefined;
  sub.trialEndsAt = undefined;
  // Reset usage
  sub.usage = {
    aiSessionsUsed: 0,
    zaloSent: 0,
    storageUsedMB: 0,
    coursesActive: sub.usage.coursesActive,
    studentsActive: sub.usage.studentsActive,
    perStudentBreakdownsUsed: 0,
    zoomCreditsUsed: 0,
  };
  return sub;
}

/**
 * Auto-create invoice cho period mới (autoRenew). Chưa thanh toán → status pending.
 */
export function createRenewalInvoice(sub: Subscription): { id: string; amountVND: number } {
  const tier = sub.plan as TenantTier;
  const plan = getPlan(tier);
  const monthly = plan.monthlyPriceVND ?? 0;
  const { total } = computeCyclePrice(monthly, sub.cycle);
  const amount = total ?? 0;
  const now = new Date();
  const months = CYCLE_MONTHS[sub.cycle];
  const periodEnd = new Date(now); periodEnd.setMonth(periodEnd.getMonth() + months);
  const id = "INV-RENEW-" + Date.now();
  db.invoices.set(id, {
    id,
    mentorId: sub.mentorId,
    issuedAt: now.toISOString().split("T")[0]!,
    periodLabel: `Auto-renew · ${now.toLocaleDateString("vi-VN")} → ${periodEnd.toLocaleDateString("vi-VN")}`,
    plan: sub.plan,
    cycle: sub.cycle,
    amountVND: amount,
    status: "pending",
    method: "VNPay",
  });
  return { id, amountVND: amount };
}

/**
 * Cron tick — gọi mỗi giờ (hoặc mỗi 15 phút trong dev). Idempotent.
 */
export function runLifecycleTick(now = new Date()): { events: number } {
  let count = 0;

  for (const sub of db.subscriptions.values()) {
    // 1. Trial expired
    if (sub.status === "trial" && sub.trialEndsAt && new Date(sub.trialEndsAt) <= now) {
      emit({ type: "trial_expired", mentorId: sub.mentorId });
      fallbackToFree(sub.mentorId);
      count++;
      continue;
    }

    // 2/3. Active period ended
    if (sub.status === "active" && new Date(sub.currentPeriodEnd) <= now) {
      if (sub.autoRenew) {
        const inv = createRenewalInvoice(sub);
        emit({ type: "renewal_invoice_created", mentorId: sub.mentorId, invoiceId: inv.id });
        // Chuyển status sang past_due (chờ thanh toán) — có grace period
        sub.status = "past_due";
      } else {
        emit({ type: "subscription_expired", mentorId: sub.mentorId });
        fallbackToFree(sub.mentorId);
      }
      count++;
      continue;
    }

    // 4. Reminder D-7
    if (sub.status === "active") {
      const daysLeft = Math.ceil((new Date(sub.currentPeriodEnd).getTime() - now.getTime()) / 86_400_000);
      if (daysLeft === 7) {
        emit({ type: "reminder_d7", mentorId: sub.mentorId, days: 7 });
        count++;
      }
    }

    // 5. Past-due quá 7 ngày → expired
    if (sub.status === "past_due") {
      const daysSinceEnd = Math.floor((now.getTime() - new Date(sub.currentPeriodEnd).getTime()) / 86_400_000);
      if (daysSinceEnd >= 7) {
        emit({ type: "past_due_expired", mentorId: sub.mentorId, days: daysSinceEnd });
        fallbackToFree(sub.mentorId);
        count++;
      }
    }
  }

  return { events: count };
}
