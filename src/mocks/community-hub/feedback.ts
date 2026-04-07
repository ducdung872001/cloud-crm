// [CH] Community Hub - Mock data for feedback module
export const MOCK_FEEDBACKS = [
  {
    id: "FB001",
    member_id: "M001",
    member_name: "Nguyen Van A",
    message: "Dieu hoa phong nam bi hong",
    category: "maintenance" as const,
    status: "open" as const,
    created_at: "2026-04-07T06:00:00Z",
    priority: "high" as const,
  },
  {
    id: "FB002",
    member_id: "M002",
    member_name: "Tran Thi B",
    message: "Muon gia han goi them 1 thang",
    category: "request" as const,
    status: "open" as const,
    created_at: "2026-04-07T03:00:00Z",
    priority: "medium" as const,
  },
  {
    id: "FB003",
    member_id: "M005",
    member_name: "Hoang Van E",
    message: "Wifi khu co-working bi cham",
    category: "maintenance" as const,
    status: "in_progress" as const,
    created_at: "2026-04-06T10:00:00Z",
    priority: "high" as const,
  },
  {
    id: "FB004",
    member_id: "M008",
    member_name: "Tran Van H",
    message: "De xuat them lop yoga buoi toi",
    category: "suggestion" as const,
    status: "resolved" as const,
    created_at: "2026-04-05T08:00:00Z",
    priority: "low" as const,
  },
];

export type FeedbackCategory = "maintenance" | "request" | "suggestion" | "complaint";
export type FeedbackStatus = "open" | "in_progress" | "resolved";
export type FeedbackPriority = "high" | "medium" | "low";
