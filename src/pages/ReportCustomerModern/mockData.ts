export const RANGE_OPTIONS = [
  { id: "today", label: "Hôm nay" },
  { id: "7days", label: "7 ngày" },
  { id: "month", label: "Tháng này" },
  { id: "prevMonth", label: "Tháng trước" },
];

export const SOURCE_OPTIONS = [
  { value: "all", label: "Tất cả nguồn" },
  { value: "pos", label: "Tại quầy" },
  { value: "online", label: "Website / Fanpage" },
  { value: "referral", label: "Giới thiệu" },
];

export const GROWTH_DATA = [18, 24, 21, 26];
export const RETURN_DATA_NEW = [62, 75, 81, 77, 84, 89];
export const RETURN_DATA_OLD = [198, 214, 238, 226, 244, 261];

export const TIER_DATA = [
  { name: "VIP", y: 8, color: "#7c3aed" },
  { name: "Thân thiết", y: 22, color: "#a78bfa" },
  { name: "Thường xuyên", y: 35, color: "#c4b5fd" },
  { name: "Mới", y: 35, color: "#ede9fe" },
];

export const REGION_DATA = [
  { name: "Hồ Chí Minh", y: 38, color: "#2563eb" },
  { name: "Hà Nội", y: 24, color: "#0f766e" },
  { name: "Miền Trung", y: 18, color: "#f59e0b" },
  { name: "Tỉnh khác", y: 20, color: "#ec4899" },
];

export const CUSTOMER_ROWS = [
  { name: "Nguyễn Thị Mai", phone: "0901 234 567", totalSpent: 12400000, loyaltyPoint: 1240, tier: "VIP", color: "#7c3aed" },
  { name: "Trần Văn Hùng", phone: "0912 345 678", totalSpent: 8600000, loyaltyPoint: 860, tier: "VIP", color: "#7c3aed" },
  { name: "Lê Thị Hoa", phone: "0923 456 789", totalSpent: 5200000, loyaltyPoint: 520, tier: "Thân thiết", color: "#2563eb" },
  { name: "Phạm Minh Tuấn", phone: "0934 567 890", totalSpent: 3800000, loyaltyPoint: 380, tier: "Thường xuyên", color: "#10b981" },
];

export const CUSTOMER_KPIS = [
  { label: "Tổng khách hàng", value: "4,821", delta: "↑ 89 KH mới tháng này", deltaClass: "up", valueClass: "accent-purple" },
  { label: "KH mới tháng này", value: "89", delta: "↑ 12.3% tháng trước", deltaClass: "up", valueClass: "" },
  { label: "Tỷ lệ quay lại mua", value: "68.4%", delta: "↑ 3.1% tháng trước", deltaClass: "up", valueClass: "accent-purple" },
  { label: "Tổng công nợ KH", value: 42600000, delta: "↑ 5.2M từ tháng trước", deltaClass: "dn", valueClass: "accent-red", isCurrency: true },
];
