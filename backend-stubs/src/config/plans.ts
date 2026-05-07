/**
 * Subscription plan registry — source of truth cho 6 tier MentorHub (theo D1).
 *
 * Tier IDs khớp với `TenantTier` ở models.ts để check access AI model.
 *
 * Pricing để placeholder (TBD) — user feedback 2026-05-06: các số 300k/800k chỉ
 * là minh hoạ, chưa chốt. UI tier mới sẽ hiển thị "Liên hệ" khi giá là null.
 *
 * Quota matrix theo D2 — AI evaluations / ZNS / Zoom credits / courses / students.
 * `-1` = unlimited.
 */

import type { TenantTier } from "./models.js";

export type BillingCycle = "monthly" | "quarterly" | "semiannual" | "yearly";

export interface PlanQuota {
  /** AI summary calls / tháng. -1 = unlimited */
  aiEvaluationsPerMonth: number;
  /** Per-student AI breakdown calls / tháng. -1 = unlimited */
  perStudentBreakdownsPerMonth: number;
  /** Zalo ZNS messages / tháng. -1 = unlimited */
  zaloMessagesPerMonth: number;
  /** Zoom credit pool ban đầu (đơn vị credit, 1 credit = 1 phút Zoom). -1 = unlimited */
  zoomCreditsPerMonth: number;
  /** Storage cap GB. -1 = unlimited */
  storageGB: number;
  /** Số khoá học đồng thời. -1 = unlimited */
  coursesLimit: number;
  /** Số học viên active đồng thời. -1 = unlimited */
  studentsLimit: number;
  /** Số mentor co-teach trên 1 khoá. -1 = unlimited */
  coMentorsPerCourse: number;
}

export interface PlanFeatures {
  customBranding: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
  /** Truy cập MCP local (Claude Code as MCP server) — Master/Academy only */
  mcpAccess: boolean;
  /** Stream response (web-socket) — từ Starter trở lên */
  streamingAi: boolean;
}

export interface Plan {
  id: TenantTier;
  /** Tên hiển thị tiếng Việt theo tinh thần giáo dục/võ học */
  displayName: string;
  /** Ý nghĩa ngắn dùng làm tagline marketing */
  tagline: string;
  /** Giá monthly VND. null = "Liên hệ" / TBD */
  monthlyPriceVND: number | null;
  /** TRUE → tier free (không cần thanh toán) */
  isFree: boolean;
  /** TRUE → tier trial (giới hạn theo time) */
  isTrial: boolean;
  /** Số ngày trial (chỉ áp dụng nếu isTrial=true) */
  trialDays?: number;
  popular?: boolean;
  highlights: string[];
  quota: PlanQuota;
  features: PlanFeatures;
  color: string;
}

const FREE_FEATURES: PlanFeatures = {
  customBranding: false,
  apiAccess: false,
  prioritySupport: false,
  whiteLabel: false,
  mcpAccess: false,
  streamingAi: false,
};

export const PLANS: Plan[] = [
  {
    id: "trial",
    displayName: "Tập sự",
    tagline: "Trải nghiệm 14 ngày — đủ để chạy 1 khoá thử.",
    monthlyPriceVND: 0,
    isFree: false,
    isTrial: true,
    trialDays: 14,
    color: "#94A3B8",
    highlights: [
      "5 buổi AI Meeting Note",
      "20 lượt phân tích từng học viên",
      "100 tin Zalo OA",
      "60 phút Zoom credit",
      "1 khoá học · 10 học viên",
    ],
    quota: {
      aiEvaluationsPerMonth: 5,
      perStudentBreakdownsPerMonth: 20,
      zaloMessagesPerMonth: 100,
      zoomCreditsPerMonth: 60,
      storageGB: 2,
      coursesLimit: 1,
      studentsLimit: 10,
      coMentorsPerCourse: 1,
    },
    features: FREE_FEATURES,
  },
  {
    id: "free",
    displayName: "Hành giả",
    tagline: "Mentor cá nhân — vĩnh viễn miễn phí, có giới hạn.",
    monthlyPriceVND: 0,
    isFree: true,
    isTrial: false,
    color: "#64748B",
    highlights: [
      "2 buổi AI Meeting Note/tháng",
      "10 lượt phân tích từng học viên",
      "50 tin Zalo OA",
      "30 phút Zoom credit",
      "1 khoá · 5 học viên · footer MentorHub",
    ],
    quota: {
      aiEvaluationsPerMonth: 2,
      perStudentBreakdownsPerMonth: 10,
      zaloMessagesPerMonth: 50,
      zoomCreditsPerMonth: 30,
      storageGB: 1,
      coursesLimit: 1,
      studentsLimit: 5,
      coMentorsPerCourse: 1,
    },
    features: FREE_FEATURES,
  },
  {
    id: "starter",
    displayName: "Đệ tử",
    tagline: "Mentor đã có lớp đầu tiên — đủ tự tin chạy đều.",
    monthlyPriceVND: null,
    isFree: false,
    isTrial: false,
    color: "#0F766E",
    highlights: [
      "10 buổi AI Meeting Note/tháng",
      "200 lượt phân tích từng học viên",
      "1.000 tin Zalo OA",
      "300 phút Zoom credit",
      "3 khoá · 50 học viên",
      "Streaming AI · Sonnet access",
    ],
    quota: {
      aiEvaluationsPerMonth: 10,
      perStudentBreakdownsPerMonth: 200,
      zaloMessagesPerMonth: 1_000,
      zoomCreditsPerMonth: 300,
      storageGB: 10,
      coursesLimit: 3,
      studentsLimit: 50,
      coMentorsPerCourse: 1,
    },
    features: { ...FREE_FEATURES, streamingAi: true },
  },
  {
    id: "pro",
    displayName: "Sư phụ",
    tagline: "Mentor có học viên đều — cần custom branding + GPT-4o.",
    monthlyPriceVND: null,
    isFree: false,
    isTrial: false,
    popular: true,
    color: "#B45309",
    highlights: [
      "30 buổi AI Meeting Note/tháng",
      "1.000 lượt phân tích từng học viên",
      "5.000 tin Zalo OA",
      "1.200 phút Zoom credit",
      "10 khoá · 300 học viên",
      "Custom branding (ẩn footer) · Priority support",
    ],
    quota: {
      aiEvaluationsPerMonth: 30,
      perStudentBreakdownsPerMonth: 1_000,
      zaloMessagesPerMonth: 5_000,
      zoomCreditsPerMonth: 1_200,
      storageGB: 50,
      coursesLimit: 10,
      studentsLimit: 300,
      coMentorsPerCourse: 2,
    },
    features: { ...FREE_FEATURES, customBranding: true, prioritySupport: true, streamingAi: true },
  },
  {
    id: "master",
    displayName: "Tông sư",
    tagline: "Mentor scale — Opus, MCP local, white-label.",
    monthlyPriceVND: null,
    isFree: false,
    isTrial: false,
    color: "#134E4A",
    highlights: [
      "100 buổi AI Meeting Note/tháng",
      "5.000 lượt phân tích từng học viên",
      "20.000 tin Zalo OA",
      "5.000 phút Zoom credit",
      "Khoá không giới hạn · 1.500 học viên",
      "Opus access · MCP local · White-label",
    ],
    quota: {
      aiEvaluationsPerMonth: 100,
      perStudentBreakdownsPerMonth: 5_000,
      zaloMessagesPerMonth: 20_000,
      zoomCreditsPerMonth: 5_000,
      storageGB: 200,
      coursesLimit: -1,
      studentsLimit: 1_500,
      coMentorsPerCourse: 5,
    },
    features: {
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      whiteLabel: true,
      mcpAccess: true,
      streamingAi: true,
    },
  },
  {
    id: "academy",
    displayName: "Học viện",
    tagline: "Multi-mentor, on-prem MCP, hợp đồng dài hạn.",
    monthlyPriceVND: null,
    isFree: false,
    isTrial: false,
    color: "#0F172A",
    highlights: [
      "Tất cả không giới hạn",
      "On-prem MCP host (tự deploy)",
      "Dedicated account manager",
      "SLA 99.9% · custom hợp đồng",
    ],
    quota: {
      aiEvaluationsPerMonth: -1,
      perStudentBreakdownsPerMonth: -1,
      zaloMessagesPerMonth: -1,
      zoomCreditsPerMonth: -1,
      storageGB: -1,
      coursesLimit: -1,
      studentsLimit: -1,
      coMentorsPerCourse: -1,
    },
    features: {
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      whiteLabel: true,
      mcpAccess: true,
      streamingAi: true,
    },
  },
];

const PLAN_INDEX: Record<TenantTier, Plan> = Object.fromEntries(
  PLANS.map((p) => [p.id, p]),
) as Record<TenantTier, Plan>;

export function getPlan(id: TenantTier): Plan {
  const p = PLAN_INDEX[id];
  if (!p) throw new Error(`[plans] Unknown tier: ${id}`);
  return p;
}

export function getQuota(id: TenantTier): PlanQuota {
  return getPlan(id).quota;
}

/** Cycle discounts giữ nguyên từ FE mock — di chuyển lên BE source-of-truth. */
export interface CycleDiscount {
  cycle: BillingCycle;
  months: number;
  discountPct: number;
  label: string;
  sublabel: string;
}

export const CYCLES: CycleDiscount[] = [
  { cycle: "monthly",    months: 1,  discountPct: 0,  label: "Hàng tháng", sublabel: "Linh hoạt nhất" },
  { cycle: "quarterly",  months: 3,  discountPct: 5,  label: "3 tháng",    sublabel: "Tiết kiệm 5%" },
  { cycle: "semiannual", months: 6,  discountPct: 10, label: "6 tháng",    sublabel: "Tiết kiệm 10%" },
  { cycle: "yearly",     months: 12, discountPct: 20, label: "12 tháng",   sublabel: "Tiết kiệm 20% · Phổ biến" },
];

export function computeCyclePrice(monthlyVND: number | null, cycle: BillingCycle) {
  if (monthlyVND == null) return { total: null, effectiveMonthly: null, saved: 0 };
  const c = CYCLES.find((x) => x.cycle === cycle)!;
  const gross = monthlyVND * c.months;
  const total = Math.round(gross * (1 - c.discountPct / 100));
  return { total, effectiveMonthly: Math.round(total / c.months), saved: gross - total };
}
