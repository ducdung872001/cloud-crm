// [CH] Community Hub - Mock data for check-in module
export const MOCK_SCAN_RESULT = {
  member_id: "M001",
  name: "Nguyễn Văn An",
  avatar: null,
  plan: "Standard",
  valid_until: "2026-04-30",
  status: "active" as const, // active | expired | suspended
  quotas: [
    { service: "Đồ uống", used: 28, total: 30, remaining: 2, unit: "lần" },
    { service: "Co-working", used: 15, total: null, remaining: null, unit: "không giới hạn" },
    { service: "Spa & Massage", used: 2, total: 4, remaining: 2, unit: "lần" },
    { service: "Phòng họp", used: 3, total: 8, remaining: 5, unit: "giờ" },
  ],
  last_checkin: "2026-04-06 17:45",
};

export const MOCK_RECENT_CHECKINS = [
  { id: 1, timestamp: "2026-04-07 08:32", member_id: "M001", name: "Nguyễn Văn An", direction: "in" as const, area: "Co-working" },
  { id: 2, timestamp: "2026-04-07 08:15", member_id: "M002", name: "Trần Thị Bình", direction: "in" as const, area: "Khu Spa" },
  { id: 3, timestamp: "2026-04-07 07:50", member_id: "M003", name: "Lê Văn Cường", direction: "out" as const, area: "Cổng chính" },
  { id: 4, timestamp: "2026-04-07 07:45", member_id: "M004", name: "Phạm Thị Dung", direction: "in" as const, area: "Co-working" },
  { id: 5, timestamp: "2026-04-07 07:30", member_id: "M005", name: "Hoàng Văn Em", direction: "in" as const, area: "Khu F&B" },
  { id: 6, timestamp: "2026-04-07 07:20", member_id: "M006", name: "Võ Thị Phương", direction: "in" as const, area: "Co-working" },
  { id: 7, timestamp: "2026-04-07 07:10", member_id: "M007", name: "Nguyễn Văn Giang", direction: "in" as const, area: "Phòng họp A" },
  { id: 8, timestamp: "2026-04-07 07:00", member_id: "M008", name: "Trần Văn Hải", direction: "in" as const, area: "Khu Spa" },
  { id: 9, timestamp: "2026-04-06 18:00", member_id: "M009", name: "Lê Thị Ích", direction: "out" as const, area: "Cổng chính" },
  { id: 10, timestamp: "2026-04-06 17:45", member_id: "M001", name: "Nguyễn Văn An", direction: "out" as const, area: "Cổng chính" },
  { id: 11, timestamp: "2026-04-06 17:30", member_id: "M010", name: "Phạm Văn Khôi", direction: "out" as const, area: "Cổng chính" },
  { id: 12, timestamp: "2026-04-06 17:15", member_id: "M002", name: "Trần Thị Bình", direction: "out" as const, area: "Khu Spa" },
  { id: 13, timestamp: "2026-04-06 16:00", member_id: "M011", name: "Hoàng Thị Lan", direction: "out" as const, area: "Co-working" },
  { id: 14, timestamp: "2026-04-06 15:30", member_id: "M012", name: "Võ Văn Minh", direction: "in" as const, area: "Phòng họp B" },
  { id: 15, timestamp: "2026-04-06 14:00", member_id: "M013", name: "Nguyễn Thị Ngọc", direction: "in" as const, area: "Khu F&B" },
  { id: 16, timestamp: "2026-04-06 13:30", member_id: "M014", name: "Trần Văn Oanh", direction: "out" as const, area: "Co-working" },
  { id: 17, timestamp: "2026-04-06 12:00", member_id: "M015", name: "Lê Văn Phúc", direction: "in" as const, area: "Khu Spa" },
  { id: 18, timestamp: "2026-04-06 11:30", member_id: "M003", name: "Lê Văn Cường", direction: "in" as const, area: "Co-working" },
  { id: 19, timestamp: "2026-04-06 10:00", member_id: "M016", name: "Phạm Thị Quỳnh", direction: "in" as const, area: "Phòng họp A" },
  { id: 20, timestamp: "2026-04-06 09:30", member_id: "M017", name: "Hoàng Văn Rạng", direction: "in" as const, area: "Co-working" },
];

export type CheckinDirection = "in" | "out";
export type MemberStatus = "active" | "expired" | "suspended";
