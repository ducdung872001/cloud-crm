// [FitPro] Business Owner profiles — 5 loại BO
// Office / Entrepreneur / Trainer / Lifestyle Ambassador / Gym Partner
//
// Profile thứ 5 (gym_partner) dành cho chủ gym/yoga đồng ý cấy plugin FitPro INSIDE
// (xem docs/urd/part-15-fitpro-phygital-roadmap.md#ur-fitpro-02)
export const MOCK_PARTNERS = [
  {
    id: "BO-001",
    name: "Nguyễn Văn A",
    role: "office" as const,
    roleLabel: "Dân văn phòng",
    area: "Hà Nội",
    avatar: null,
    tier: 1,
    stations_owned: 1,
    stations_downline: 4, // 7 là max
    total_members_served: 82,
    commission_this_month_vnd: 18500000,
    commission_rate: 0.5, // cấp cao 50%
    referrals: 5,
    joined_date: "2025-09-10",
    problem: "Chán ngán 8 tiếng gò bó, kẹt xe",
    solution: "Tìm lối thoát sống đam mê, làm chủ quỹ thời gian",
  },
  {
    id: "BO-002",
    name: "Trần Thị B",
    role: "entrepreneur" as const,
    roleLabel: "Chủ doanh nghiệp",
    area: "Hồ Chí Minh",
    avatar: null,
    tier: 1,
    stations_owned: 2,
    stations_downline: 7,
    total_members_served: 156,
    commission_this_month_vnd: 45000000,
    commission_rate: 0.5,
    referrals: 12,
    joined_date: "2025-08-01",
    problem: "Chôn vốn vào mặt bằng, chi phí cố định cao",
    solution: "Mô hình khởi nghiệp tinh gọn, đòn bẩy vốn mạnh mẽ",
  },
  {
    id: "BO-003",
    name: "Lê Văn C",
    role: "trainer" as const,
    roleLabel: "Huấn luyện viên (PT/Yoga)",
    area: "Đà Nẵng",
    avatar: null,
    tier: 2,
    stations_owned: 1,
    stations_downline: 3,
    total_members_served: 68,
    commission_this_month_vnd: 9800000,
    commission_rate: 0.25, // cấp thấp 25%
    referrals: 4,
    joined_date: "2025-11-15",
    problem: "Bán sức lấy tiền theo giờ, thu nhập bị giới hạn",
    solution: "Nhân bản thu nhập, tối ưu kết quả không phụ thuộc máy móc",
  },
  {
    id: "BO-004",
    name: "Phạm Thị D",
    role: "ambassador" as const,
    roleLabel: "Đại sứ lối sống khỏe",
    area: "Nghệ An",
    avatar: null,
    tier: 2,
    stations_owned: 1,
    stations_downline: 2,
    total_members_served: 42,
    commission_this_month_vnd: 6200000,
    commission_rate: 0.25,
    referrals: 3,
    joined_date: "2025-12-01",
    problem: "Muốn chăm sóc gia đình nhưng thiếu nguồn lực công cụ",
    solution: "Biến tổ ấm thành trung tâm sức khỏe, tạo dòng tiền từ giúp đỡ người khác",
  },
  {
    id: "BO-005",
    name: "Hoàng Văn E",
    role: "trainer" as const,
    roleLabel: "Huấn luyện viên (PT/Yoga)",
    area: "Hà Nội",
    avatar: null,
    tier: 3,
    stations_owned: 1,
    stations_downline: 0,
    total_members_served: 18,
    commission_this_month_vnd: 2100000,
    commission_rate: 0.25,
    referrals: 1,
    joined_date: "2026-02-10",
    problem: "Bán sức lấy tiền theo giờ, thu nhập bị giới hạn",
    solution: "Nhân bản thu nhập không phụ thuộc máy móc",
  },
  // ── Profile thứ 5: Chủ Gym Partner (INSIDE model) ──
  {
    id: "BO-PARTNER-001",
    name: "Nguyễn Minh F",
    role: "gym_partner" as const,
    roleLabel: "Chủ Gym Partner (California Gym)",
    area: "Hà Nội",
    avatar: null,
    tier: 1,
    stations_owned: 1, // 1 trạm INSIDE tại gym của họ
    stations_downline: 0,
    total_members_served: 240, // hội viên sẵn có của gym chủ
    commission_this_month_vnd: 12000000, // 20% doanh thu digital
    commission_rate: 0.2, // 20% — cho INSIDE model
    referrals: 0,
    joined_date: "2026-03-10",
    problem: "Phòng gym có sẵn cơ sở vật chất nhưng thiếu giải pháp digital + dinh dưỡng để tăng ARPU",
    solution: "Cấy plugin FitPro INSIDE 0 đồng, chia sẻ doanh thu digital 20%, giữ nguyên thương hiệu gốc",
  },
];

export type PartnerRole = "office" | "entrepreneur" | "trainer" | "ambassador" | "gym_partner";
