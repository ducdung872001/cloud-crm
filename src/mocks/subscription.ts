// Subscription plans, usage quota, billing cycles — mock for MentorHub MVP
// When BE ready, replace với fetch từ /api/v1/subscription/*

export type PlanId = "trial" | "starter" | "pro" | "unlimited";
export type BillingCycle = "monthly" | "quarterly" | "semiannual" | "yearly";
export type SubscriptionStatus = "trial" | "active" | "canceled_at_period_end" | "expired" | "past_due";

export interface PlanFeatures {
  aiSessions: number; // AI Meeting Note gen/tháng; -1 = unlimited
  zaloMessages: number; // tin Zalo/tháng qua OA chung; -1 = unlimited
  storageGB: number;
  coursesLimit: number; // số khoá đồng thời; -1 = unlimited
  studentsLimit: number; // -1 = unlimited
  aiModel: "haiku" | "sonnet"; // model dùng cho AI summary
  customBranding: boolean; // ẩn footer "qua MentorHub"
  apiAccess: boolean;
  prioritySupport: boolean;
}

export interface PlanTier {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPriceVND: number; // 0 cho trial
  popular?: boolean;
  highlights: string[]; // top 3-5 điểm nổi bật
  features: PlanFeatures;
  color: string;
}

export const PLANS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Bắt đầu dạy chuyên nghiệp.",
    monthlyPriceVND: 99_000,
    color: "#0F766E",
    highlights: [
      "5 buổi AI Meeting Note/tháng",
      "500 tin Zalo nhắc lịch",
      "3 khoá học đồng thời",
      "Tối đa 50 học viên",
      "Email support",
    ],
    features: {
      aiSessions: 5,
      zaloMessages: 500,
      storageGB: 10,
      coursesLimit: 3,
      studentsLimit: 50,
      aiModel: "haiku",
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Cho mentor đã có học viên đều.",
    monthlyPriceVND: 299_000,
    popular: true,
    color: "#B45309",
    highlights: [
      "20 buổi AI Meeting Note/tháng",
      "2,000 tin Zalo",
      "10 khoá học đồng thời",
      "Tối đa 500 học viên",
      "Ẩn footer MentorHub (custom branding)",
      "Priority support 2h",
    ],
    features: {
      aiSessions: 20,
      zaloMessages: 2_000,
      storageGB: 50,
      coursesLimit: 10,
      studentsLimit: 500,
      aiModel: "haiku",
      customBranding: true,
      apiAccess: false,
      prioritySupport: true,
    },
  },
  {
    id: "unlimited",
    name: "Unlimited",
    tagline: "Mentor scale — không giới hạn.",
    monthlyPriceVND: 899_000,
    color: "#134E4A",
    highlights: [
      "100 buổi AI Meeting Note/tháng",
      "Tin Zalo không giới hạn",
      "Khoá học không giới hạn",
      "Học viên không giới hạn",
      "AI Claude Sonnet (thay Haiku)",
      "API access + White-label",
      "Dedicated account manager",
    ],
    features: {
      aiSessions: 100,
      zaloMessages: -1,
      storageGB: 500,
      coursesLimit: -1,
      studentsLimit: -1,
      aiModel: "sonnet",
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
];

export const TRIAL_FEATURES: PlanFeatures = {
  aiSessions: 5, // giới hạn trial để dùng thử
  zaloMessages: 100,
  storageGB: 5,
  coursesLimit: 2,
  studentsLimit: 20,
  aiModel: "haiku",
  customBranding: false,
  apiAccess: false,
  prioritySupport: false,
};

export interface CycleDiscount {
  cycle: BillingCycle;
  months: number;
  discountPct: number; // giảm trên tổng
  label: string;
  sublabel: string;
}

export const CYCLES: CycleDiscount[] = [
  { cycle: "monthly",   months: 1,  discountPct: 0,  label: "Hàng tháng",         sublabel: "Linh hoạt nhất" },
  { cycle: "quarterly", months: 3,  discountPct: 5,  label: "3 tháng",            sublabel: "Tiết kiệm 5%" },
  { cycle: "semiannual", months: 6, discountPct: 10, label: "6 tháng",            sublabel: "Tiết kiệm 10%" },
  { cycle: "yearly",    months: 12, discountPct: 20, label: "12 tháng",           sublabel: "Tiết kiệm 20% · Phổ biến" },
];

export const computeCyclePrice = (monthlyVND: number, cycle: BillingCycle): { total: number; effectiveMonthly: number; saved: number } => {
  const c = CYCLES.find((x) => x.cycle === cycle)!;
  const gross = monthlyVND * c.months;
  const total = Math.round(gross * (1 - c.discountPct / 100));
  const effectiveMonthly = Math.round(total / c.months);
  const saved = gross - total;
  return { total, effectiveMonthly, saved };
};

// ── Current mentor subscription (MOCK) ────────────────────────────────────────
// Mentor mới đăng ký được tự động 1 tháng trial
const now = new Date();
const trialStart = new Date(now); trialStart.setDate(now.getDate() - 8); // trial started 8 days ago
const trialEnd = new Date(now); trialEnd.setDate(now.getDate() + 22); // ends in 22 days

export interface MentorSubscription {
  mentorId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  cycle: BillingCycle;
  trialStartedAt?: string;
  trialEndsAt?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingAt?: string | null; // null nếu đã huỷ auto-renew
  nextBillingAmountVND?: number;
  autoRenew: boolean;
  usage: {
    aiSessionsUsed: number;
    zaloSent: number;
    storageUsedMB: number;
    coursesActive: number;
    studentsActive: number;
  };
}

export const MOCK_SUBSCRIPTION: MentorSubscription = {
  mentorId: "MT-001",
  plan: "trial",
  status: "trial",
  cycle: "monthly",
  trialStartedAt: trialStart.toISOString(),
  trialEndsAt: trialEnd.toISOString(),
  currentPeriodStart: trialStart.toISOString(),
  currentPeriodEnd: trialEnd.toISOString(),
  nextBillingAt: trialEnd.toISOString(),
  nextBillingAmountVND: 99_000,
  autoRenew: true,
  usage: {
    aiSessionsUsed: 2,
    zaloSent: 47,
    storageUsedMB: 340,
    coursesActive: 1,
    studentsActive: 9,
  },
};

// Billing history
export interface Invoice {
  id: string;
  issuedAt: string;
  periodLabel: string;
  plan: PlanId;
  cycle: BillingCycle;
  amountVND: number;
  status: "paid" | "pending" | "failed" | "refunded";
  method: "VNPay" | "Bank transfer" | "Credit card" | "Trial";
  downloadUrl?: string;
}

export const MOCK_INVOICES: Invoice[] = [
  { id: "INV-2026-002", issuedAt: "2026-04-15", periodLabel: "Trial · 01/04 → 30/04/2026", plan: "trial", cycle: "monthly", amountVND: 0, status: "paid", method: "Trial" },
  // Khi mentor chưa từng nâng cấp, chỉ có invoice trial
];

// ── Platform-wide usage log (for Reborn admin monitoring) ────────────────────
export interface UsageLogEntry {
  mentorId: string;
  mentorName: string;
  plan: PlanId;
  sessions: number;
  whisperCostUSD: number;
  claudeCostUSD: number;
  storageUSD: number;
  revenueVND: number; // tiền mentor trả cho Reborn
  status: SubscriptionStatus;
}

// Mock 15 mentors cho admin dashboard
export const MOCK_PLATFORM_USAGE: UsageLogEntry[] = [
  { mentorId: "MT-001", mentorName: "Nguyễn Trọng Khoa", plan: "trial", sessions: 2, whisperCostUSD: 0.16, claudeCostUSD: 0.06, storageUSD: 0.02, revenueVND: 0, status: "trial" },
  { mentorId: "MT-002", mentorName: "Phạm Thu Hà",      plan: "pro",   sessions: 18, whisperCostUSD: 1.44, claudeCostUSD: 0.54, storageUSD: 0.15, revenueVND: 299_000, status: "active" },
  { mentorId: "MT-003", mentorName: "Vũ Hoàng Nam",     plan: "unlimited", sessions: 62, whisperCostUSD: 4.96, claudeCostUSD: 5.58, storageUSD: 0.42, revenueVND: 899_000, status: "active" },
  { mentorId: "MT-004", mentorName: "Đặng Minh Tuấn",   plan: "pro",   sessions: 14, whisperCostUSD: 1.12, claudeCostUSD: 0.42, storageUSD: 0.12, revenueVND: 299_000, status: "active" },
  { mentorId: "MT-005", mentorName: "Lê Thanh Hương",   plan: "pro",   sessions: 21, whisperCostUSD: 1.68, claudeCostUSD: 0.63, storageUSD: 0.18, revenueVND: 299_000, status: "active" },
  { mentorId: "MT-006", mentorName: "Trần Minh Quân",   plan: "starter", sessions: 4, whisperCostUSD: 0.32, claudeCostUSD: 0.12, storageUSD: 0.05, revenueVND: 99_000, status: "active" },
  { mentorId: "MT-007", mentorName: "Hoàng Thu Trang",  plan: "starter", sessions: 3, whisperCostUSD: 0.24, claudeCostUSD: 0.09, storageUSD: 0.04, revenueVND: 99_000, status: "active" },
  { mentorId: "MT-008", mentorName: "Bùi Đức Năng",     plan: "trial", sessions: 1, whisperCostUSD: 0.08, claudeCostUSD: 0.03, storageUSD: 0.01, revenueVND: 0, status: "trial" },
  { mentorId: "MT-009", mentorName: "Trần Văn An",      plan: "pro",   sessions: 17, whisperCostUSD: 1.36, claudeCostUSD: 0.51, storageUSD: 0.14, revenueVND: 299_000, status: "active" },
  { mentorId: "MT-010", mentorName: "Phan Hoàng Linh",  plan: "unlimited", sessions: 88, whisperCostUSD: 7.04, claudeCostUSD: 7.92, storageUSD: 0.65, revenueVND: 899_000, status: "active" },
  { mentorId: "MT-011", mentorName: "Đỗ Minh Châu",     plan: "starter", sessions: 2, whisperCostUSD: 0.16, claudeCostUSD: 0.06, storageUSD: 0.03, revenueVND: 99_000, status: "active" },
  { mentorId: "MT-012", mentorName: "Nguyễn Kim Anh",   plan: "pro",   sessions: 19, whisperCostUSD: 1.52, claudeCostUSD: 0.57, storageUSD: 0.16, revenueVND: 299_000, status: "canceled_at_period_end" },
  { mentorId: "MT-013", mentorName: "Hồ Quang Hải",     plan: "pro",   sessions: 8, whisperCostUSD: 0.64, claudeCostUSD: 0.24, storageUSD: 0.08, revenueVND: 299_000, status: "active" },
  { mentorId: "MT-014", mentorName: "Lê Minh Tuấn B",   plan: "starter", sessions: 5, whisperCostUSD: 0.4, claudeCostUSD: 0.15, storageUSD: 0.05, revenueVND: 99_000, status: "active" },
  { mentorId: "MT-015", mentorName: "Trịnh Thái Sơn",   plan: "trial", sessions: 0, whisperCostUSD: 0, claudeCostUSD: 0, storageUSD: 0, revenueVND: 0, status: "expired" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
export const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

export const getFeaturesFor = (plan: PlanId): PlanFeatures => {
  if (plan === "trial") return TRIAL_FEATURES;
  return PLANS.find((p) => p.id === plan)!.features;
};

export const getPlanById = (id: PlanId): PlanTier | null => {
  if (id === "trial") return null;
  return PLANS.find((p) => p.id === id) || null;
};

export const daysBetween = (from: string | Date, to: string | Date): number => {
  const d1 = new Date(from).getTime();
  const d2 = new Date(to).getTime();
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
};

export const daysRemaining = (until: string | Date): number => {
  return Math.max(0, daysBetween(new Date(), until));
};
