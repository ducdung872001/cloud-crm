// [CH] Community Hub - Mock data for reports module
export const MOCK_MRR_REPORT = {
  current_month: { mrr_vnd: 47000000, members: 47, avg_revenue_per_member: 1000000 },
  churn_this_month: 2,
  new_members_this_month: 5,
  history: [
    { month: "2026-01", mrr: 30000000, members: 30 },
    { month: "2026-02", mrr: 38000000, members: 38 },
    { month: "2026-03", mrr: 43000000, members: 43 },
    { month: "2026-04", mrr: 47000000, members: 47 },
  ],
};

export const MOCK_CHECKIN_REPORT = {
  today: 23,
  this_week: 145,
  this_month: 580,
  by_area: [
    { area: "Co-working", count: 210 },
    { area: "Khu Spa", count: 85 },
    { area: "Khu F&B", count: 150 },
    { area: "Phòng họp", count: 65 },
    { area: "Phòng nghỉ", count: 70 },
  ],
  by_hour: [
    { hour: "07:00", count: 12 },
    { hour: "08:00", count: 25 },
    { hour: "09:00", count: 30 },
    { hour: "10:00", count: 18 },
    { hour: "11:00", count: 15 },
    { hour: "12:00", count: 8 },
    { hour: "13:00", count: 20 },
    { hour: "14:00", count: 22 },
    { hour: "15:00", count: 16 },
    { hour: "16:00", count: 14 },
    { hour: "17:00", count: 28 },
    { hour: "18:00", count: 10 },
  ],
};

export const MOCK_SERVICE_REPORT = {
  total_usage_this_month: 580,
  by_service: [
    { service: "Đồ uống", usage: 210, revenue: 0 },
    { service: "Co-working", usage: 180, revenue: 0 },
    { service: "Spa & Massage", usage: 85, revenue: 4250000 },
    { service: "Phòng họp", usage: 65, revenue: 3250000 },
    { service: "Cắt tóc", usage: 40, revenue: 2000000 },
  ],
};
