import type { Request, Response, NextFunction } from "express";
import { getQuota } from "../config/plans.js";
import type { TenantTier } from "../config/models.js";
import { db } from "../db/store.js";
import type { PlanId } from "../db/types.js";

/**
 * Quota enforcement middleware factory (D2 — quota matrix theo tier).
 *
 *   router.post("/notes", requireQuota("aiEvaluation", 1), handler);
 *
 * Đọc subscription của mentor → resolve tier → check usage counter.
 * Vượt quota → 429. Trong handler, gọi `recordUsage(req, "aiEvaluation", n)`
 * sau khi action thành công để tăng counter.
 *
 * NOTE Phase 1: trong-memory; sau Phase 1.1 audit DB sẽ wire vào usage_log thật.
 */

export type Meter =
  | "aiEvaluation"            // 1 buổi summary
  | "perStudentBreakdown"     // 1 lượt phân tích từng HV
  | "zaloMessage"             // 1 tin ZNS
  | "zoomCredit"              // 1 phút Zoom (đơn vị credit)
  | "storageMB";              // upload file MB

const METER_TO_QUOTA_KEY: Record<Meter, keyof ReturnType<typeof getQuota>> = {
  aiEvaluation: "aiEvaluationsPerMonth",
  perStudentBreakdown: "perStudentBreakdownsPerMonth",
  zaloMessage: "zaloMessagesPerMonth",
  zoomCredit: "zoomCreditsPerMonth",
  storageMB: "storageGB", // note: caller phải convert MB→GB hoặc reverse
};

/**
 * Map legacy PlanId (4-tier cũ trong db/types.ts) → TenantTier (6-tier mới).
 * Sau Phase 1.1 sẽ migrate hẳn types — middleware giữ mapping để không vỡ
 * subscription seed hiện tại.
 */
export function mapLegacyPlanToTier(plan: PlanId | TenantTier): TenantTier {
  switch (plan) {
    case "trial": return "trial";
    case "starter": return "starter";
    case "pro": return "pro";
    case "unlimited": return "master"; // unlimited cũ ≈ master mới
    case "free": return "free";
    case "master": return "master";
    case "academy": return "academy";
    default: return "free";
  }
}

/** Counter usage trong tháng hiện tại — period key YYYY-MM. */
const usageCounters = new Map<string, Map<Meter, number>>();

function periodKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function counterKey(mentorId: string, period: string): string {
  return `${mentorId}::${period}`;
}

function getCounter(mentorId: string, meter: Meter): number {
  const key = counterKey(mentorId, periodKey());
  return usageCounters.get(key)?.get(meter) ?? 0;
}

function bumpCounter(mentorId: string, meter: Meter, delta: number) {
  const key = counterKey(mentorId, periodKey());
  let bucket = usageCounters.get(key);
  if (!bucket) {
    bucket = new Map();
    usageCounters.set(key, bucket);
  }
  bucket.set(meter, (bucket.get(meter) ?? 0) + delta);
}

export function getCurrentTier(mentorId: string): TenantTier {
  const sub = db.subscriptions.get(mentorId);
  if (!sub) return "free";
  return mapLegacyPlanToTier(sub.plan);
}

export interface QuotaCheckResult {
  allowed: boolean;
  tier: TenantTier;
  meter: Meter;
  limit: number;
  used: number;
  remaining: number;
  unlimited: boolean;
}

export function checkQuota(mentorId: string, meter: Meter, cost = 1): QuotaCheckResult {
  const tier = getCurrentTier(mentorId);
  const quota = getQuota(tier);
  const quotaKey = METER_TO_QUOTA_KEY[meter];
  const limit = quota[quotaKey] as number;
  const used = getCounter(mentorId, meter);
  const unlimited = limit === -1;
  const allowed = unlimited || used + cost <= limit;
  return {
    allowed,
    tier,
    meter,
    limit,
    used,
    remaining: unlimited ? -1 : Math.max(0, limit - used),
    unlimited,
  };
}

/** Express middleware. Attach kết quả vào req.quota để handler dùng tiếp. */
export function requireQuota(meter: Meter, cost = 1) {
  return function (req: Request, res: Response, next: NextFunction) {
    const r = checkQuota(req.mentorId, meter, cost);
    req.quota = r;
    if (!r.allowed) {
      return res.status(429).json({
        error: "quota_exceeded",
        meter: r.meter,
        tier: r.tier,
        limit: r.limit,
        used: r.used,
        message: `Hết hạn mức ${meter} cho gói ${r.tier} (${r.used}/${r.limit}). Nâng cấp plan để tiếp tục.`,
      });
    }
    next();
  };
}

/** Gọi sau khi action thực sự thành công, để tăng counter. */
export function recordUsage(req: Request, meter: Meter, cost = 1) {
  bumpCounter(req.mentorId, meter, cost);
}

/** Test-only: reset counters giữa test runs. */
export function _resetQuotaForTesting() {
  usageCounters.clear();
}

declare module "express-serve-static-core" {
  interface Request {
    quota?: QuotaCheckResult;
  }
}
