// [CH] Community Hub - Mock data for dashboard
export const MOCK_DASHBOARD = {
  members: { active: 47, total_slots: 200, expiring_soon: 8 },
  checkins_today: 23,
  mrr_vnd: 47000000,
  quota_alerts: [
    { member_id: "M001", name: "Nguyen Van A", service: "Do uong", remaining: 2, total: 30 },
    { member_id: "M002", name: "Tran Thi B", service: "Spa", remaining: 0, total: 4 },
    { member_id: "M003", name: "Le Van C", service: "Phong hop", remaining: 1, total: 8 },
    { member_id: "M004", name: "Pham Thi D", service: "Do uong", remaining: 3, total: 30 },
    { member_id: "M005", name: "Hoang Van E", service: "Spa", remaining: 1, total: 4 },
  ],
  upcoming_events: [
    { id: "E001", title: "CLB Doc sach", date: "2026-04-10", attendees: 12 },
    { id: "E002", title: "Khoa hoc Marketing", date: "2026-04-12", attendees: 8 },
    { id: "E003", title: "CLB Khoi nghiep", date: "2026-04-14", attendees: 15 },
  ],
  building_map: [
    { area: "Co-working", capacity: 50, current: 23, status: "active" as const },
    { area: "Khu Spa", capacity: 10, current: 4, status: "active" as const },
    { area: "Phong hop A", capacity: 8, current: 0, status: "available" as const },
    { area: "Phong hop B", capacity: 12, current: 6, status: "active" as const },
    { area: "Khu F&B", capacity: 30, current: 12, status: "active" as const },
    { area: "Phong nghi Nam", capacity: 12, current: 10, status: "active" as const },
    { area: "Phong nghi Nu", capacity: 10, current: 8, status: "active" as const },
  ],
};
