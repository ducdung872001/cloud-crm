// [CH] Community Hub - Mock data for reports module
// Thiết kế theo insight ngành co-living / community space

// ═══ 1. MRR / ARR & Doanh thu ═══
export const MOCK_MRR_REPORT = {
  current_month: { mrr_vnd: 47000000, members: 47, avg_revenue_per_member: 1000000 },
  arr_vnd: 564000000,
  churn_this_month: 2,
  new_members_this_month: 5,
  churn_rate_pct: 4.3,
  retention_rate_pct: 95.7,
  revenue_breakdown: {
    membership_fee: 42000000,
    extra_services: 3500000,
    courses_paid: 1500000,
  },
  history: [
    { month: "2026-01", mrr: 30000000, members: 30, new_m: 8, churn: 2 },
    { month: "2026-02", mrr: 38000000, members: 38, new_m: 10, churn: 2 },
    { month: "2026-03", mrr: 43000000, members: 43, new_m: 7, churn: 2 },
    { month: "2026-04", mrr: 47000000, members: 47, new_m: 5, churn: 1 },
  ],
};

// ═══ 2. Thành viên ═══
export const MOCK_MEMBER_REPORT = {
  total: 200,
  active: 47,
  expired: 12,
  suspended: 3,
  expiring_7_days: 8,
  by_plan: [
    { plan: "Basic", count: 12, pct: 25.5 },
    { plan: "Standard", count: 25, pct: 53.2 },
    { plan: "Premium", count: 10, pct: 21.3 },
  ],
  by_type: [
    { type: "Cá nhân", count: 35 },
    { type: "Hạt nhân", count: 5 },
    { type: "KOL/PO", count: 4 },
    { type: "Gia đình", count: 3 },
  ],
  avg_stay_months: 4.2,
  lifetime_value_vnd: 4200000,
  top_referrers: [
    { name: "Phạm Thị Hà", referrals: 7 },
    { name: "Lê Văn Hùng", referrals: 5 },
    { name: "Trần Thị Kim", referrals: 3 },
  ],
};

// ═══ 3. Check-in & Sử dụng không gian ═══
export const MOCK_CHECKIN_REPORT = {
  today: 23,
  this_week: 145,
  this_month: 580,
  avg_per_day: 19.3,
  peak_hour: "09:00",
  by_area: [
    { area: "Co-working", count: 210, pct: 36.2 },
    { area: "Khu F&B", count: 150, pct: 25.9 },
    { area: "Khu Spa", count: 85, pct: 14.7 },
    { area: "Phòng nghỉ", count: 70, pct: 12.1 },
    { area: "Phòng họp", count: 65, pct: 11.2 },
  ],
  by_hour: [
    { hour: "07:00", count: 12 }, { hour: "08:00", count: 25 },
    { hour: "09:00", count: 30 }, { hour: "10:00", count: 18 },
    { hour: "11:00", count: 15 }, { hour: "12:00", count: 8 },
    { hour: "13:00", count: 20 }, { hour: "14:00", count: 22 },
    { hour: "15:00", count: 16 }, { hour: "16:00", count: 14 },
    { hour: "17:00", count: 28 }, { hour: "18:00", count: 10 },
  ],
  occupancy_rate: [
    { area: "Co-working", rate: 46 },
    { area: "Khu Spa", rate: 40 },
    { area: "Phòng họp A", rate: 0 },
    { area: "Phòng họp B", rate: 50 },
    { area: "Khu F&B", rate: 40 },
    { area: "KTX Nam", rate: 83 },
    { area: "KTX Nữ", rate: 80 },
  ],
};

// ═══ 4. Dịch vụ & Quota ═══
export const MOCK_SERVICE_REPORT = {
  total_usage_this_month: 580,
  quota_utilization_pct: 68,
  members_over_80_pct_quota: 12,
  by_service: [
    { service: "Đồ uống", usage: 210, revenue: 0, in_plan: true, avg_per_member: 4.5 },
    { service: "Co-working", usage: 180, revenue: 0, in_plan: true, avg_per_member: 3.8 },
    { service: "Spa & Massage", usage: 85, revenue: 4250000, in_plan: false, avg_per_member: 1.8 },
    { service: "Phòng họp", usage: 65, revenue: 3250000, in_plan: false, avg_per_member: 1.4 },
    { service: "Cắt tóc", usage: 40, revenue: 2000000, in_plan: false, avg_per_member: 0.9 },
    { service: "Yoga", usage: 35, revenue: 1750000, in_plan: false, avg_per_member: 0.7 },
    { service: "Giặt là", usage: 28, revenue: 420000, in_plan: false, avg_per_member: 0.6 },
  ],
  upsell_opportunities: [
    { service: "Spa & Massage", members: 15, reason: "Dùng hết quota, có nhu cầu mua thêm" },
    { service: "Phòng họp", members: 8, reason: "Đặt ngoài giờ, chưa có gói phù hợp" },
  ],
};

// ═══ 5. Đối tác (KOL/PO) ═══
export const MOCK_PARTNER_REPORT = {
  total_partners: 4,
  total_commission_vnd: 5000000,
  total_referrals: 27,
  total_students: 90,
  by_partner: [
    { name: "Phạm Thị Hà", role: "KOL", commission: 1200000, referrals: 7, courses: 3, students: 45 },
    { name: "Nguyễn Văn Ích", role: "PO", commission: 2500000, referrals: 12, courses: 0, students: 0 },
    { name: "Lê Văn Hùng", role: "KOL", commission: 800000, referrals: 5, courses: 2, students: 30 },
    { name: "Trần Thị Kim", role: "KOC", commission: 500000, referrals: 3, courses: 1, students: 15 },
  ],
  commission_trend: [
    { month: "2026-01", amount: 3200000 },
    { month: "2026-02", amount: 3800000 },
    { month: "2026-03", amount: 4500000 },
    { month: "2026-04", amount: 5000000 },
  ],
};

// ═══ 6. Tài chính & Công nợ ═══
export const MOCK_FINANCE_REPORT = {
  revenue_this_month: 52500000,
  expense_this_month: 38000000,
  profit_this_month: 14500000,
  profit_margin_pct: 27.6,
  receivable_vnd: 8500000,
  payable_vnd: 3200000,
  overdue_receivable: 2800000,
  overdue_count: 3,
  revenue_by_source: [
    { source: "Phí thành viên", amount: 42000000, pct: 80.0 },
    { source: "Dịch vụ ngoài gói", amount: 5500000, pct: 10.5 },
    { source: "Sản phẩm bán lẻ", amount: 3500000, pct: 6.7 },
    { source: "Khóa học trả phí", amount: 1500000, pct: 2.9 },
  ],
  expense_by_category: [
    { category: "Nhân sự", amount: 18000000, pct: 47.4 },
    { category: "Nguyên vật liệu", amount: 8000000, pct: 21.1 },
    { category: "Tiện ích (điện, nước)", amount: 5000000, pct: 13.2 },
    { category: "Hoa hồng đối tác", amount: 5000000, pct: 13.2 },
    { category: "Khác", amount: 2000000, pct: 5.3 },
  ],
  monthly_trend: [
    { month: "2026-01", revenue: 35000000, expense: 30000000, profit: 5000000 },
    { month: "2026-02", revenue: 42000000, expense: 33000000, profit: 9000000 },
    { month: "2026-03", revenue: 48000000, expense: 36000000, profit: 12000000 },
    { month: "2026-04", revenue: 52500000, expense: 38000000, profit: 14500000 },
  ],
};
