// [CH] Community Hub - Mock data for courses & clubs module
export const MOCK_COURSES = [
  {
    id: "CRS-01",
    title: "Marketing 0 đồng",
    instructor: "Phạm Thị Hà (KOL)",
    type: "paid" as const,
    price: 500000,
    enrolled: 12,
    max_slots: 20,
    status: "active" as const,
    start_date: "2026-04-15",
    sessions: 8,
  },
  {
    id: "CRS-02",
    title: "Thiền & Mindfulness",
    instructor: "Nguyễn Văn Phong",
    type: "free" as const,
    price: 0,
    enrolled: 8,
    max_slots: 15,
    status: "active" as const,
    start_date: "2026-04-10",
    sessions: 12,
  },
  {
    id: "CRS-03",
    title: "Yoga cơ bản",
    instructor: "Trần Thị Giang",
    type: "paid" as const,
    price: 300000,
    enrolled: 15,
    max_slots: 15,
    status: "full" as const,
    start_date: "2026-04-08",
    sessions: 10,
  },
  {
    id: "CRS-04",
    title: "Nấu ăn healthy",
    instructor: "Lê Văn Hùng (KOL)",
    type: "paid" as const,
    price: 400000,
    enrolled: 6,
    max_slots: 12,
    status: "active" as const,
    start_date: "2026-04-20",
    sessions: 6,
  },
];

export const MOCK_CLUBS = [
  { id: "CLB-01", name: "CLB Đọc sách", members: 15, leader: "Trần Thị Giang", next_meeting: "2026-04-10 19:00" },
  { id: "CLB-02", name: "CLB Khởi nghiệp", members: 23, leader: "Lê Văn Hùng", next_meeting: "2026-04-12 09:00" },
  { id: "CLB-03", name: "CLB Chạy bộ", members: 18, leader: "Phạm Văn Ích", next_meeting: "2026-04-09 06:00" },
  { id: "CLB-04", name: "CLB Âm nhạc", members: 10, leader: "Hoàng Thị Kim", next_meeting: "2026-04-11 20:00" },
];

export type CourseType = "paid" | "free";
export type CourseStatus = "active" | "full" | "completed" | "cancelled";
