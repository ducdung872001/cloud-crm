export type SessionType = "kickoff" | "review" | "change" | "uat" | "internal";

export interface MeetingSession {
  id: string;
  type: SessionType;
  title: string;
  date: string;
  duration: string;
  attendees: string;
  tags: { label: string; variant: "ai" | "info" | "warn" | "ok" | "scope" | "hu" }[];
  actionLabel: string;
}

export const SESSIONS: MeetingSession[] = [
  {
    id: "rev-2",
    type: "review",
    title: "Review #2 · Chốt prototype v2 + chỉnh URD",
    date: "18/04/2026",
    duration: "38:14",
    attendees: "A.Minh, C.Lan, C.Hương, A.Đức",
    tags: [
      { label: "REVIEW", variant: "info" },
      { label: "URD v1.2 → v1.3", variant: "ai" },
      { label: "3 feedback", variant: "ok" },
    ],
    actionLabel: "Xem diff →",
  },
  {
    id: "chg-1",
    type: "change",
    title: "Change Request · Multi-language support",
    date: "16/04/2026",
    duration: "24:08",
    attendees: "A.Minh, C.Hương",
    tags: [
      { label: "CHANGE", variant: "warn" },
      { label: "+15 ngày", variant: "scope" },
      { label: "Chờ KH ký", variant: "warn" },
    ],
    actionLabel: "Xem CR →",
  },
  {
    id: "rev-1",
    type: "review",
    title: "Review #1 · KH review prototype v1",
    date: "14/04/2026",
    duration: "52:30",
    attendees: "A.Minh, C.Lan, C.Hương, A.Đức",
    tags: [
      { label: "REVIEW", variant: "info" },
      { label: "URD v1.1 → v1.2", variant: "ai" },
      { label: "5 feedback", variant: "ok" },
    ],
    actionLabel: "Xem →",
  },
  {
    id: "kickoff",
    type: "kickoff",
    title: "Kickoff · Khảo sát yêu cầu ban đầu",
    date: "15/04/2026",
    duration: "47:23",
    attendees: "A.Minh, C.Lan, C.Hương, A.Đức",
    tags: [
      { label: "KICKOFF", variant: "ai" },
      { label: "URD v1.0", variant: "ai" },
      { label: "24 requirements", variant: "ok" },
    ],
    actionLabel: "Xem →",
  },
];

export interface ChangeRequest {
  id: string;
  code: string;
  session: string;
  title: string;
  description: string;
  status: "pending" | "approved";
  impact: {
    type: string;
    typeColor: string;
    timeline: string;
    timelineColor?: string;
    cost: string;
    costColor?: string;
    stages: string;
  };
}

export const CHANGES: ChangeRequest[] = [
  {
    id: "cr-003",
    code: "CR-003 · Session #3",
    session: "chg-1",
    title: "Thêm multi-language support",
    description: "KH yêu cầu hệ thống hỗ trợ thêm tiếng Anh cho backend admin + tiếng Hàn cho content màn hình tại chi nhánh có khách du lịch.",
    status: "pending",
    impact: {
      type: "MAJOR",
      typeColor: "var(--amber-500)",
      timeline: "+15 ngày",
      cost: "+$2,400",
      stages: "FE, BE, QA",
    },
  },
  {
    id: "cr-002",
    code: "CR-002 · Session #2",
    session: "rev-2",
    title: "Bỏ tích hợp POS",
    description: "KH quyết định bỏ FR-018 vì Q3/2026 thay hệ thống POS mới. Auto tracked từ Review #2.",
    status: "approved",
    impact: {
      type: "MINOR (reduce)",
      typeColor: "var(--emerald-500)",
      timeline: "-5 ngày",
      timelineColor: "var(--emerald-500)",
      cost: "-$800",
      costColor: "var(--emerald-500)",
      stages: "BE",
    },
  },
];

export interface Deliverable {
  id: string;
  icoLabel: string;
  icoClass: string;
  name: string;
  meta: string;
  tag: { label: string; variant: "ok" | "ai" | "hu" | "warn" };
}

export const DELIVERABLES: Deliverable[] = [
  {
    id: "urd-v13",
    icoLabel: "URD",
    icoClass: "ico-doc",
    name: "URD v1.3 (final)",
    meta: "27 requirements · Approved 18/04",
    tag: { label: "Final", variant: "ok" },
  },
  {
    id: "proto-v2",
    icoLabel: "HTM",
    icoClass: "ico-html",
    name: "Prototype v2",
    meta: "Share link · 45 KB",
    tag: { label: "Live", variant: "ok" },
  },
  {
    id: "fe-repo",
    icoLabel: "FE",
    icoClass: "ico-code",
    name: "megamart-dooh-fe",
    meta: "GitLab · main · 284 KB gzipped",
    tag: { label: "Stage 4", variant: "ai" },
  },
  {
    id: "be-repo",
    icoLabel: "BE",
    icoClass: "ico-code",
    name: "megamart-dooh-api",
    meta: "GitLab · develop · 27 endpoints",
    tag: { label: "Stage 5", variant: "ai" },
  },
];
