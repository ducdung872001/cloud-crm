// [CH] Community Hub - Mock data for member quota
export const MOCK_MEMBER_QUOTA = {
  plan: "Standard - 2.500.000đ/tháng",
  valid_until: "2026-04-30",
  quotas: [
    { service: "Đồ uống", used: 28, total: 30, unit: "lần/tháng" },
    { service: "Co-working", used: 15, total: null, unit: "không giới hạn" },
    { service: "Spa & Massage", used: 2, total: 4, unit: "lần/tháng" },
    { service: "Phòng họp", used: 3, total: 8, unit: "giờ/tháng" },
  ],
  family_members: [{ name: "Trần Thị Chi (vợ)", status: "active" }],
};

export const MOCK_CHECKIN_HISTORY = [
  { timestamp: "2026-04-07 08:32", area: "Cổng chính", method: "QR", direction: "in" as const },
  { timestamp: "2026-04-07 17:45", area: "Cổng chính", method: "QR", direction: "out" as const },
  { timestamp: "2026-04-06 09:10", area: "Khu Spa", method: "Thẻ chip", direction: "in" as const },
  { timestamp: "2026-04-06 11:30", area: "Khu Spa", method: "Thẻ chip", direction: "out" as const },
  { timestamp: "2026-04-05 08:15", area: "Cổng chính", method: "QR", direction: "in" as const },
  { timestamp: "2026-04-05 18:00", area: "Cổng chính", method: "QR", direction: "out" as const },
];
