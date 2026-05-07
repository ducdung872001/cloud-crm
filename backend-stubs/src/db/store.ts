/**
 * In-memory DB. Thay bằng Postgres+Prisma khi port production.
 * Để dễ port, mỗi "collection" là Map<id, entity>.
 */
import type {
  ZoomConnection, MeetingNote, Subscription, Invoice, UsageLog, ZaloMapping,
  Course, SessionEntity, PreClassChecklist, SentReminder,
  MentorOnboardingState, CustomFieldDefinition, CustomFieldValue,
  PromptTemplateOverride, CreditWallet, CreditTransaction, CreditRule,
  ZoomPoolAccount, ZoomSlot, ZoomBooking,
  Material, MaterialAccessPolicy, EmbedWhitelistEntry, PublicMentorProfile,
  ReferralLink, ReferralAttribution, CommissionRule,
} from "./types.js";

export const db = {
  zoomConnections: new Map<string, ZoomConnection>(),
  meetingNotes: new Map<string, MeetingNote>(),
  subscriptions: new Map<string, Subscription>(),
  invoices: new Map<string, Invoice>(),
  usageLogs: [] as UsageLog[],
  zaloMappings: new Map<string, ZaloMapping>(),

  // Phase 4 entities
  courses: new Map<string, Course>(),
  sessions: new Map<string, SessionEntity>(),
  preClassChecklists: new Map<string, PreClassChecklist>(),     // keyed by sessionId
  sentReminders: [] as SentReminder[],
  mentorOnboarding: new Map<string, MentorOnboardingState>(),    // keyed by mentorId
  customFieldDefs: new Map<string, CustomFieldDefinition>(),
  customFieldValues: [] as CustomFieldValue[],
  promptOverrides: new Map<string, PromptTemplateOverride>(),

  // Phase 6 — credit pool + Zoom slot pool
  creditWallets: new Map<string, CreditWallet>(),       // keyed by tenantId
  creditTransactions: [] as CreditTransaction[],
  creditRules: new Map<string, CreditRule>(),           // keyed by tenantId
  zoomPoolAccounts: new Map<string, ZoomPoolAccount>(), // keyed by id
  zoomSlots: new Map<string, ZoomSlot>(),               // keyed by id
  zoomBookings: new Map<string, ZoomBooking>(),

  // Phase 7 — content + marketing + analytics
  materials: new Map<string, Material>(),
  materialAccessPolicies: [] as MaterialAccessPolicy[],
  embedWhitelist: new Map<string, EmbedWhitelistEntry>(),
  mentorProfiles: new Map<string, PublicMentorProfile>(),  // keyed by mentorId
  mentorProfileSlugIndex: new Map<string, string>(),       // slug → mentorId
  referralLinks: new Map<string, ReferralLink>(),          // keyed by id
  referralCodeIndex: new Map<string, string>(),            // code → linkId
  referralAttributions: new Map<string, ReferralAttribution>(), // keyed by id
  commissionRules: new Map<string, CommissionRule>(),      // keyed by tenantId
};

// ── Seed mock data ─────────────────────────────────────────────────────────
const now = new Date();
const trialEnd = new Date(now); trialEnd.setDate(now.getDate() + 22);

db.subscriptions.set("MT-001", {
  mentorId: "MT-001",
  plan: "trial",
  status: "trial",
  cycle: "monthly",
  trialStartedAt: new Date(now.getTime() - 8 * 86400_000).toISOString(),
  trialEndsAt: trialEnd.toISOString(),
  currentPeriodStart: new Date(now.getTime() - 8 * 86400_000).toISOString(),
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
});

db.invoices.set("INV-2026-002", {
  id: "INV-2026-002",
  mentorId: "MT-001",
  issuedAt: "2026-04-15",
  periodLabel: "Trial · 01/04 → 30/04/2026",
  plan: "trial",
  cycle: "monthly",
  amountVND: 0,
  status: "paid",
  method: "Trial",
});

// Sample meeting note
db.meetingNotes.set("MN-2026-001", {
  id: "MN-2026-001",
  mentorId: "MT-001",
  courseId: "CRS-01",
  sessionNumber: 3,
  sessionTitle: "Service Discovery & Load Balancing",
  date: "2026-04-21",
  status: "ready",
  duration: "1h 58m",
  attendance: { present: 21, late: 3, absent: 2, total: 26 },
  sentiment: { positive: 78, neutral: 18, negative: 4 },
  summary: "Buổi học tập trung vào service discovery patterns...",
  keyPoints: [
    { time: "02:14", text: "Giới thiệu service discovery pattern" },
    { time: "28:30", text: "Load balancing strategies" },
  ],
  questions: [
    { time: "0:34:11", student: "Trần Văn Đức", q: "Split-brain trong Eureka?", a: "Peer-awareness mode với quorum 3+ nodes." },
  ],
  actionItems: ["Implement Eureka, deadline 26/04", "Đọc trước: Istio Architecture"],
  recordingUrl: null,
  createdAt: new Date().toISOString(),
});

// ── Phase 4 seed: 1 course + sessions sắp tới + onboarding state ──────────────
db.courses.set("CRS-01", {
  id: "CRS-01",
  tenantId: "TENANT-MT-001",
  ownerMentorId: "MT-001",
  coMentorIds: [],
  name: "Microservice Architecture Mastery",
  status: "active",
  studentIds: ["S1", "S2", "S3", "S4", "S5"],
  autoSendPostClass: true,
  createdAt: new Date(now.getTime() - 30 * 86400_000).toISOString(),
});

const sessionStarts = [
  new Date(now.getTime() + 2 * 60 * 60_000),   // H-2 reminder match (vừa qua mốc 2h)
  new Date(now.getTime() + 24 * 60 * 60_000),  // D-1
  new Date(now.getTime() + 3 * 86400_000),     // D-3
  new Date(now.getTime() + 7 * 86400_000),     // xa hơn
];
sessionStarts.forEach((scheduledAt, idx) => {
  const id = `SES-${idx + 4}`;
  db.sessions.set(id, {
    id,
    tenantId: "TENANT-MT-001",
    courseId: "CRS-01",
    mentorId: "MT-001",
    sessionNumber: 4 + idx,
    title: `Session ${4 + idx} (seed)`,
    scheduledAt: scheduledAt.toISOString(),
    durationMin: 90,
    status: "scheduled",
    createdAt: new Date().toISOString(),
  });
});

db.mentorOnboarding.set("MT-001", {
  mentorId: "MT-001",
  tenantId: "TENANT-MT-001",
  steps: {
    zoom_connected: false,
    zalo_connected: false,
    first_course_created: true,    // có course CRS-01
    first_student_invited: true,   // có 5 student
    first_session_scheduled: true, // có session
  },
  updatedAt: new Date().toISOString(),
});

// ── Phase 6 seed: wallet + rules + pool accounts + free slots ─────────────
// Khởi tạo wallet rỗng + log seed grant qua transaction để invariant đúng
db.creditWallets.set("TENANT-MT-001", {
  tenantId: "TENANT-MT-001",
  balance: 60,
  earnedThisPeriod: 60,
  spentThisPeriod: 0,
  rules: { monthlyGrant: 60, swapRatePct: 0, rolloverEnabled: false, rolloverCap: 0 },
  updatedAt: new Date().toISOString(),
});
db.creditTransactions.push({
  id: "CTX-seed01",
  tenantId: "TENANT-MT-001",
  type: "grant",
  amount: 60,
  balanceAfter: 60,
  reason: "seed_initial_grant",
  createdBy: "system",
  createdAt: new Date().toISOString(),
});

db.creditRules.set("TENANT-MT-001", {
  tenantId: "TENANT-MT-001",
  monthlyGrant: 60,            // trial = 60 phút
  swapRatePct: 0,
  rolloverEnabled: false,
  rolloverCap: 0,
  earnRules: [
    { source: "refer_mentor", creditPerEvent: 100, enabled: true },
    { source: "contribute_pool", creditPerEvent: 30, enabled: false },
    { source: "complete_course", creditPerEvent: 50, enabled: true },
    { source: "community_review", creditPerEvent: 10, enabled: true },
  ],
  tierDiscountPct: 0,
  updatedAt: new Date().toISOString(),
  updatedBy: "system",
});

// 3 pool accounts: 1 platform licensed + 2 mentor seed
db.zoomPoolAccounts.set("ZA-001", {
  id: "ZA-001",
  ownerType: "platform",
  ownerId: "REBORN_HQ",
  zoomUserId: "z-platform-1",
  zoomEmail: "platform-pool-1@mentorhub.vn",
  zoomDisplayName: "MentorHub Pool 1",
  licensed: true,
  maxConcurrent: 1,
  status: "available",
  contributorEarnRatePct: 0,
  joinedPoolAt: new Date(now.getTime() - 60 * 86400_000).toISOString(),
  lastVerifiedAt: new Date(now.getTime() - 1 * 86400_000).toISOString(),
});
db.zoomPoolAccounts.set("ZA-002", {
  id: "ZA-002",
  ownerType: "mentor",
  ownerId: "MT-002",
  zoomUserId: "z-m2",
  zoomEmail: "mt002@example.com",
  zoomDisplayName: "Mentor 002",
  licensed: false,
  maxConcurrent: 1,
  status: "available",
  contributorEarnRatePct: 50,    // mentor góp account → giữ 50% credit
  joinedPoolAt: new Date(now.getTime() - 14 * 86400_000).toISOString(),
});
db.zoomPoolAccounts.set("ZA-003", {
  id: "ZA-003",
  ownerType: "wit",
  ownerId: "WIT-VOL-001",
  zoomUserId: "z-wit1",
  zoomEmail: "vol1@wit-community.vn",
  zoomDisplayName: "WIT Volunteer 1",
  licensed: true,
  maxConcurrent: 1,
  status: "available",
  contributorEarnRatePct: 70,    // WIT volunteer earn cao hơn (community USP)
  joinedPoolAt: new Date(now.getTime() - 7 * 86400_000).toISOString(),
});

// ── Phase 7 seed ────────────────────────────────────────────────────────
// Embed whitelist global
const WHITELIST_DEFAULTS: Array<[string, EmbedWhitelistEntry["provider"]]> = [
  ["notion.so", "notion"], ["*.notion.site", "notion"],
  ["drive.google.com", "drive"], ["docs.google.com", "drive"],
  ["loom.com", "loom"], ["*.loom.com", "loom"],
  ["youtube.com", "youtube"], ["youtu.be", "youtube"],
  ["vimeo.com", "vimeo"], ["miro.com", "miro"], ["figma.com", "figma"],
];
WHITELIST_DEFAULTS.forEach(([domain, provider], i) => {
  const id = `EMW-${i + 1}`;
  db.embedWhitelist.set(id, {
    id, tenantId: "PLATFORM", domainPattern: domain, provider,
    allowIframe: true, enabled: true, createdAt: new Date().toISOString(),
  });
});

// Public mentor profile mẫu MT-001 (superset của legacy Portal/MENTORS mock)
db.mentorProfiles.set("MT-001", {
  mentorId: "MT-001",
  tenantId: "TENANT-MT-001",
  slug: "nguyen-trong-khoa",
  // Legacy compat
  name: "Nguyễn Trọng Khoa",
  short: "NT",
  title: "Principal Engineer, Ex-Grab",
  avatarBg: "#134E4A",
  tags: ["Microservices", "Distributed Systems", "K8s"],
  verified: true,
  coursesCount: 3,
  studentsCount: 1240,
  nps: 4.92,
  // Editor extension
  headline: "Solution Architect — 12 năm hệ thống phân tán & cloud-native",
  bio: "Mentor Pro chuyên sâu microservices, từng dẫn dắt migration cho 5+ enterprise team từ monolith sang distributed.",
  expertise: ["Microservices", "Distributed Systems", "K8s", "Service Mesh", "Event-Driven", "AWS"],
  yearsExperience: 12,
  links: [
    { type: "linkedin", url: "https://linkedin.com/in/nguyen-trong-khoa" },
    { type: "github", url: "https://github.com/khoa-nt" },
  ],
  publicCourseIds: ["CRS-01"],
  testimonials: [
    { studentName: "Trần Văn Đức", quote: "Khoá học rất thực tiễn, Khoa giải thích rất dễ hiểu.", courseName: "Microservice Architecture Mastery", rating: 5 },
  ],
  published: true,
  publishedAt: new Date(now.getTime() - 14 * 86400_000).toISOString(),
  updatedAt: new Date().toISOString(),
});
db.mentorProfileSlugIndex.set("nguyen-trong-khoa", "MT-001");

// Default commission rule (platform-level)
db.commissionRules.set("PLATFORM", {
  tenantId: "PLATFORM",
  ratesByPlan: { starter: 20, pro: 15, master: 10, academy: 5 },
  recurring: true,
  maxRecurringMonths: 12,
  minPayoutVND: 500_000,
  updatedAt: new Date().toISOString(),
});

// Referral link mẫu
db.referralLinks.set("RL-001", {
  id: "RL-001",
  ownerMentorId: "MT-001",
  tenantId: "TENANT-MT-001",
  code: "KHOA2026",
  campaign: "spring-2026-launch",
  active: true,
  createdAt: new Date().toISOString(),
});
db.referralCodeIndex.set("KHOA2026", "RL-001");

// Material mẫu
db.materials.set("MAT-001", {
  id: "MAT-001",
  tenantId: "TENANT-MT-001",
  courseId: "CRS-01",
  uploaderMentorId: "MT-001",
  title: "Service Discovery — Slide buổi 3",
  description: "Slide chính + reading list",
  kind: "slide",
  mimeType: "application/pdf",
  sizeBytes: 1_245_000,
  storageKey: "tenant/TENANT-MT-001/materials/MAT-001.pdf",
  version: 1,
  status: "active",
  createdAt: new Date(now.getTime() - 5 * 86400_000).toISOString(),
});

// Seed một số free slot trong 7 ngày tới (mỗi account ~ 4 slot/ngày)
const SLOT_DURATION_HRS = 1.5;
for (const [accId, _] of db.zoomPoolAccounts) {
  for (let day = 1; day <= 7; day++) {
    for (let hr of [9, 14, 19]) {
      const start = new Date(now.getTime() + day * 86400_000);
      start.setUTCHours(hr, 0, 0, 0);
      const end = new Date(start.getTime() + SLOT_DURATION_HRS * 3_600_000);
      const id = `ZS-${accId}-d${day}-h${hr}`;
      db.zoomSlots.set(id, {
        id,
        accountId: accId,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        status: "free",
      });
    }
  }
}
