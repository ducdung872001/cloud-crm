// [CH] Community Hub - Mock data for dashboard
export const MOCK_DASHBOARD = {
  members: { active: 47, total_slots: 200, expiring_soon: 8 },
  checkins_today: 23,
  mrr_vnd: 47000000,
  quota_alerts: [
    { member_id: "M001", name: "Nguyễn Văn An", service: "Đồ uống", remaining: 2, total: 30 },
    { member_id: "M002", name: "Trần Thị Bình", service: "Spa", remaining: 0, total: 4 },
    { member_id: "M003", name: "Lê Văn Cường", service: "Phòng họp", remaining: 1, total: 8 },
    { member_id: "M004", name: "Phạm Thị Dung", service: "Đồ uống", remaining: 3, total: 30 },
    { member_id: "M005", name: "Hoàng Văn Em", service: "Spa", remaining: 1, total: 4 },
  ],
  upcoming_events: [
    { id: "E001", title: "CLB Đọc sách", date: "2026-04-10", attendees: 12 },
    { id: "E002", title: "Khóa học Marketing", date: "2026-04-12", attendees: 8 },
    { id: "E003", title: "CLB Khởi nghiệp", date: "2026-04-14", attendees: 15 },
  ],
  building_map: [
    { area: "Co-working", capacity: 50, current: 23, status: "active" as const },
    { area: "Khu Spa", capacity: 10, current: 4, status: "active" as const },
    { area: "Phòng họp A", capacity: 8, current: 0, status: "available" as const },
    { area: "Phòng họp B", capacity: 12, current: 6, status: "active" as const },
    { area: "Khu F&B", capacity: 30, current: 12, status: "active" as const },
    { area: "Phòng nghỉ Nam", capacity: 12, current: 10, status: "active" as const },
    { area: "Phòng nghỉ Nữ", capacity: 10, current: 8, status: "active" as const },
  ],
};
