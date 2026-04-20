// [CH] Community Hub - Mock data for feedback module
export const MOCK_FEEDBACKS = [
  {
    id: "FB001",
    member_id: "M001",
    member_name: "Nguyễn Văn An",
    message: "Điều hòa phòng nam bị hỏng",
    category: "maintenance" as const,
    status: "open" as const,
    created_at: "2026-04-07T06:00:00Z",
    priority: "high" as const,
  },
  {
    id: "FB002",
    member_id: "M002",
    member_name: "Trần Thị Bình",
    message: "Muốn gia hạn gói thêm 1 tháng",
    category: "request" as const,
    status: "open" as const,
    created_at: "2026-04-07T03:00:00Z",
    priority: "medium" as const,
  },
  {
    id: "FB003",
    member_id: "M005",
    member_name: "Hoàng Văn Em",
    message: "Wifi khu co-working bị chậm",
    category: "maintenance" as const,
    status: "in_progress" as const,
    created_at: "2026-04-06T10:00:00Z",
    priority: "high" as const,
  },
  {
    id: "FB004",
    member_id: "M008",
    member_name: "Trần Văn Hải",
    message: "Đề xuất thêm lớp yoga buổi tối",
    category: "suggestion" as const,
    status: "resolved" as const,
    created_at: "2026-04-05T08:00:00Z",
    priority: "low" as const,
  },
];

export type FeedbackCategory = "maintenance" | "request" | "suggestion" | "complaint";
export type FeedbackStatus = "open" | "in_progress" | "resolved";
export type FeedbackPriority = "high" | "medium" | "low";
