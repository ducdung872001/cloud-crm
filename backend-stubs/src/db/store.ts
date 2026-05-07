/**
 * In-memory DB. Thay bằng Postgres+Prisma khi port production.
 * Để dễ port, mỗi "collection" là Map<id, entity>.
 */
import type {
  ZoomConnection, MeetingNote, Subscription, Invoice, UsageLog, ZaloMapping,
  Course, SessionEntity, PreClassChecklist, SentReminder,
  MentorOnboardingState, CustomFieldDefinition, CustomFieldValue,
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
