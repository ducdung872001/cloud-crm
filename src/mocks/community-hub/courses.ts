// [CH] Community Hub - Mock data for courses & clubs module
export const MOCK_COURSES = [
  {
    id: "CRS-01",
    title: "Marketing 0 dong",
    instructor: "Pham Thi E (KOL)",
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
    title: "Thien & Mindfulness",
    instructor: "Nguyen Van F",
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
    title: "Yoga co ban",
    instructor: "Tran Thi G",
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
    title: "Nau an healthy",
    instructor: "Le Van H (KOL)",
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
  { id: "CLB-01", name: "CLB Doc sach", members: 15, leader: "Tran Thi G", next_meeting: "2026-04-10 19:00" },
  { id: "CLB-02", name: "CLB Khoi nghiep", members: 23, leader: "Le Van H", next_meeting: "2026-04-12 09:00" },
  { id: "CLB-03", name: "CLB Chay bo", members: 18, leader: "Pham Van I", next_meeting: "2026-04-09 06:00" },
  { id: "CLB-04", name: "CLB Am nhac", members: 10, leader: "Hoang Thi K", next_meeting: "2026-04-11 20:00" },
];

export type CourseType = "paid" | "free";
export type CourseStatus = "active" | "full" | "completed" | "cancelled";
