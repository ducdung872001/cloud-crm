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

// ── Phase 4 entities ────────────────────────────────────────────────────────

export type ChecklistItemKey =
  | "zoom_link_created"
  | "payment_received"
  | "invite_sent"
  | "oa_optin"
  | "talking_points_ready"
  | "slide_uploaded";

export interface PreClassChecklistItem {
  key: ChecklistItemKey;
  label: string;
  done: boolean;
  /** Khi auto-tick từ event nào (tracking) */
  autoTickedBy?: "zoom_meeting_created" | "payment_webhook" | "invite_sent_event" | "manual";
  doneAt?: string;
  /** Số HV đã đạt (cho item check theo HV như payment_received, oa_optin) */
  studentsDone?: number;
  studentsTotal?: number;
}

export interface PreClassChecklist {
  id: string;
  tenantId: string;
  sessionId: string;
  courseId: string;
  mentorId: string;
  items: PreClassChecklistItem[];
  /** Tỉ lệ hoàn thành 0..1 (cache, recompute khi update) */
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export type ReminderTrigger = "D-3" | "D-1" | "H-2";

export interface SentReminder {
  id: string;
  tenantId: string;
  sessionId: string;
  trigger: ReminderTrigger;
  /** Đối tượng nhận: mentor hoặc tất cả students */
  audience: "mentor" | "students" | "both";
  sentAt: string;
}

export interface MentorOnboardingState {
  mentorId: string;
  tenantId: string;
  /** Step status — ordered */
  steps: {
    zoom_connected: boolean;
    zalo_connected: boolean;
    first_course_created: boolean;
    first_student_invited: boolean;
    first_session_scheduled: boolean;
  };
  completedAt?: string;
  updatedAt: string;
}

export interface CustomFieldDefinition {
  id: string;
  tenantId: string;
  /** Entity nào mang field này: "student" | "course" */
  scope: "student" | "course";
  name: string;
  /** snake_case key dùng làm DB column name khi BE port sang Postgres */
  key: string;
  type: "text" | "number" | "date" | "select" | "multi_select" | "boolean";
  required: boolean;
  options?: string[];   // cho type select / multi_select
  description?: string;
  createdAt: string;
}

export interface CustomFieldValue {
  /** Composite: tenantId + entityType + entityId + fieldKey unique */
  tenantId: string;
  entityType: "student" | "course";
  entityId: string;
  fieldKey: string;
  /** Stored as JSON string — BE port sang JSONB column */
  value: string | number | boolean | string[] | null;
  updatedAt: string;
}

// ── Phase 5: prompt template override per tenant ────────────────────────────

export interface PromptTemplateOverride {
  id: string;
  tenantId: string;
  /** Match với prompt name ở registry (session-summary, per-student-breakdown, ...) */
  name: string;
  /** Version tự đặt cho override này — không trùng default v1/v2 */
  version: string;
  description: string;
  cacheable: boolean;
  system: string;
  /** User template — string với placeholder `{{varName}}` */
  userTemplate?: string;
  /** Active = tenant này dùng override này thay default */
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;     // mentorId
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
