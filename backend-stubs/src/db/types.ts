// Entity types — match với OpenAPI schema trong docs/mentorhub-api.openapi.yaml

/**
 * Legacy 4-tier — vẫn dùng cho seed cũ + FE mock đến khi Phase 2 migrate.
 * Source-of-truth mới: `TenantTier` (6 tier) ở config/models.ts + plans.ts.
 * Mapper: middleware/quota.ts → mapLegacyPlanToTier()
 */
export type PlanId = "trial" | "starter" | "pro" | "unlimited";
export type BillingCycle = "monthly" | "quarterly" | "semiannual" | "yearly";
export type SubscriptionStatus = "trial" | "active" | "canceled_at_period_end" | "expired" | "past_due";

// ── Multi-tenant entities (Phase 1.1 audit) ──────────────────────────────────
// Bổ sung schema cho 6-tier + multi-tenant + post-class flow + credit pool.
// Chưa wire vào db.store — sẽ mở rộng dần ở Phase 2/3/6.

export interface Tenant {
  id: string;                  // TENANT-xxx
  name: string;
  ownerMentorId: string;
  /** Tier hiện tại (6-tier mới). Resolve từ subscription.plan + mapper. */
  tier: "trial" | "free" | "starter" | "pro" | "master" | "academy";
  createdAt: string;
  /** White-label config (Master/Academy) */
  brandName?: string;
  brandLogoUrl?: string;
  customDomain?: string;
}

export interface Mentor {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: "owner" | "co-mentor" | "assistant";
  zaloUserId?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  tenantId: string;
  fullName: string;
  email?: string;
  phone?: string;
  zaloUserId?: string;
  /** OA followed → đủ quyền nhận ZNS không tốn quota */
  zaloOaFollowed: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  tenantId: string;
  ownerMentorId: string;
  /** Co-mentors / assistants được gán dạy chung */
  coMentorIds: string[];
  name: string;
  description?: string;
  status: "draft" | "active" | "completed" | "archived";
  studentIds: string[];
  /** Auto-send ZNS sau mỗi buổi (default true cho Pro+) */
  autoSendPostClass: boolean;
  createdAt: string;
}

export interface SessionEntity {
  id: string;
  tenantId: string;
  courseId: string;
  mentorId: string;
  sessionNumber: number;
  title: string;
  scheduledAt: string;
  durationMin?: number;
  zoomMeetingId?: string;
  status: "scheduled" | "live" | "ended" | "cancelled";
  /** Link tới MeetingNote sau khi xử lý xong */
  meetingNoteId?: string;
  createdAt: string;
}

/** Credit pool theo tenant — D4 configurable rules. */
export interface CreditWallet {
  tenantId: string;
  /** Số credit hiện có (1 credit = 1 phút Zoom hoặc rule custom) */
  balance: number;
  /** Tổng credit nạp từ subscription tháng này */
  earnedThisPeriod: number;
  /** Tổng credit dùng tháng này */
  spentThisPeriod: number;
  /** Rule rate: monthly grant, swap rate, tier discount — JSON config */
  rules: {
    monthlyGrant: number;
    /** % discount khi đổi credit thành Zoom phút (Pro+) */
    swapRatePct: number;
    /** Có cho phép tích luỹ qua tháng không */
    rolloverEnabled: boolean;
    /** Cap rollover (-1 = unlimited) */
    rolloverCap: number;
  };
  updatedAt: string;
}

export interface ZoomConnection {
  mentorId: string;
  connected: boolean;
  status: "active" | "expired" | "revoked" | "error";
  zoomUserId?: string;
  zoomEmail?: string;
  zoomDisplayName?: string;
  zoomAccountType?: "basic" | "licensed" | "on_prem";
  accessToken?: string; // encrypted at rest production
  refreshToken?: string;
  expiresAt?: string;
  connectedAt?: string;
}

export interface MeetingNote {
  id: string;
  mentorId: string;
  courseId: string;
  sessionNumber: number;
  sessionTitle: string;
  date: string;
  status: "processing" | "ready" | "failed";
  duration?: string;
  attendance?: { present: number; late: number; absent: number; total: number };
  sentiment?: { positive: number; neutral: number; negative: number };
  summary?: string;
  transcript?: string;
  keyPoints?: { time: string; text: string }[];
  questions?: { time: string; student: string; q: string; a: string }[];
  actionItems?: string[];
  recordingUrl?: string | null;
  zoomMeetingId?: string;
  createdAt: string;
}

export interface UsageSummary {
  aiSessionsUsed: number;
  zaloSent: number;
  storageUsedMB: number;
  coursesActive: number;
  studentsActive: number;
  /** Phase 1.1: counter mới cho post-class flow */
  perStudentBreakdownsUsed?: number;
  zoomCreditsUsed?: number;
}

export interface Subscription {
  mentorId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  cycle: BillingCycle;
  trialStartedAt?: string;
  trialEndsAt?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingAt?: string | null;
  nextBillingAmountVND?: number;
  autoRenew: boolean;
  usage: UsageSummary;
}

export interface Invoice {
  id: string;
  mentorId: string;
  issuedAt: string;
  periodLabel: string;
  plan: PlanId;
  cycle: BillingCycle;
  amountVND: number;
  status: "paid" | "pending" | "failed" | "refunded";
  method: "VNPay" | "Bank transfer" | "Credit card" | "ZaloPay" | "Trial";
  downloadUrl?: string;
  paymentRedirectUrl?: string;
}

// Usage log — 1 dòng / AI call, để tính cost + charge
export interface UsageLog {
  id: string;
  /** Tenant scope (Phase 1.1) — nullable trong dữ liệu cũ */
  tenantId?: string;
  mentorId: string;
  sessionId?: string;
  step: "whisper" | "claude" | "storage" | "zalo_push" | "per_student_breakdown" | "zoom_credit";
  /** Canonical model id (claude-haiku-4-5, gpt-4o, ...) — match config/models.ts */
  model?: string;
  promptVersion?: string;
  tokensIn?: number;
  tokensOut?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  audioSeconds?: number;
  costUSD: number;
  costVND: number;
  durationMs?: number;
  createdAt: string;
}

export interface ZaloMapping {
  mentorId: string;
  zaloUserId: string;
  displayName: string;
  phone?: string;
  avatar?: string;
  oaFollowed: boolean; // đã kết bạn OA MentorHub chưa
  linkedAt: string;
}
