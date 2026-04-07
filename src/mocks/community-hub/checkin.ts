// [CH] Community Hub - Mock data for check-in module
export const MOCK_SCAN_RESULT = {
  member_id: "M001",
  name: "Nguyen Van A",
  avatar: null,
  plan: "Standard",
  valid_until: "2026-04-30",
  status: "active" as const, // active | expired | suspended
  quotas: [
    { service: "Do uong", used: 28, total: 30, remaining: 2, unit: "lan" },
    { service: "Co-working", used: 15, total: null, remaining: null, unit: "khong gioi han" },
    { service: "Spa & Massage", used: 2, total: 4, remaining: 2, unit: "lan" },
    { service: "Phong hop", used: 3, total: 8, remaining: 5, unit: "gio" },
  ],
  last_checkin: "2026-04-06 17:45",
};

export const MOCK_RECENT_CHECKINS = [
  { id: 1, timestamp: "2026-04-07 08:32", member_id: "M001", name: "Nguyen Van A", direction: "in" as const, area: "Co-working" },
  { id: 2, timestamp: "2026-04-07 08:15", member_id: "M002", name: "Tran Thi B", direction: "in" as const, area: "Khu Spa" },
  { id: 3, timestamp: "2026-04-07 07:50", member_id: "M003", name: "Le Van C", direction: "out" as const, area: "Cong chinh" },
  { id: 4, timestamp: "2026-04-07 07:45", member_id: "M004", name: "Pham Thi D", direction: "in" as const, area: "Co-working" },
  { id: 5, timestamp: "2026-04-07 07:30", member_id: "M005", name: "Hoang Van E", direction: "in" as const, area: "Khu F&B" },
  { id: 6, timestamp: "2026-04-07 07:20", member_id: "M006", name: "Vo Thi F", direction: "in" as const, area: "Co-working" },
  { id: 7, timestamp: "2026-04-07 07:10", member_id: "M007", name: "Nguyen Van G", direction: "in" as const, area: "Phong hop A" },
  { id: 8, timestamp: "2026-04-07 07:00", member_id: "M008", name: "Tran Van H", direction: "in" as const, area: "Khu Spa" },
  { id: 9, timestamp: "2026-04-06 18:00", member_id: "M009", name: "Le Thi I", direction: "out" as const, area: "Cong chinh" },
  { id: 10, timestamp: "2026-04-06 17:45", member_id: "M001", name: "Nguyen Van A", direction: "out" as const, area: "Cong chinh" },
  { id: 11, timestamp: "2026-04-06 17:30", member_id: "M010", name: "Pham Van K", direction: "out" as const, area: "Cong chinh" },
  { id: 12, timestamp: "2026-04-06 17:15", member_id: "M002", name: "Tran Thi B", direction: "out" as const, area: "Khu Spa" },
  { id: 13, timestamp: "2026-04-06 16:00", member_id: "M011", name: "Hoang Thi L", direction: "out" as const, area: "Co-working" },
  { id: 14, timestamp: "2026-04-06 15:30", member_id: "M012", name: "Vo Van M", direction: "in" as const, area: "Phong hop B" },
  { id: 15, timestamp: "2026-04-06 14:00", member_id: "M013", name: "Nguyen Thi N", direction: "in" as const, area: "Khu F&B" },
  { id: 16, timestamp: "2026-04-06 13:30", member_id: "M014", name: "Tran Van O", direction: "out" as const, area: "Co-working" },
  { id: 17, timestamp: "2026-04-06 12:00", member_id: "M015", name: "Le Van P", direction: "in" as const, area: "Khu Spa" },
  { id: 18, timestamp: "2026-04-06 11:30", member_id: "M003", name: "Le Van C", direction: "in" as const, area: "Co-working" },
  { id: 19, timestamp: "2026-04-06 10:00", member_id: "M016", name: "Pham Thi Q", direction: "in" as const, area: "Phong hop A" },
  { id: 20, timestamp: "2026-04-06 09:30", member_id: "M017", name: "Hoang Van R", direction: "in" as const, area: "Co-working" },
];

export type CheckinDirection = "in" | "out";
export type MemberStatus = "active" | "expired" | "suspended";
