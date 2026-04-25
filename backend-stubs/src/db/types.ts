// Entity types — match với OpenAPI schema trong docs/mentorhub-api.openapi.yaml

export type PlanId = "trial" | "starter" | "pro" | "unlimited";
export type BillingCycle = "monthly" | "quarterly" | "semiannual" | "yearly";
export type SubscriptionStatus = "trial" | "active" | "canceled_at_period_end" | "expired" | "past_due";

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
  mentorId: string;
  sessionId?: string;
  step: "whisper" | "claude" | "storage" | "zalo_push";
  model?: string; // whisper-large-v3 | haiku-4-5 | sonnet-4-6
  tokensIn?: number;
  tokensOut?: number;
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
