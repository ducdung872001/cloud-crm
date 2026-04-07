// [CH] Community Hub - Mock data for member quota
export const MOCK_MEMBER_QUOTA = {
  plan: "Standard - 2.500.000d/thang",
  valid_until: "2026-04-30",
  quotas: [
    { service: "Do uong", used: 28, total: 30, unit: "lan/thang" },
    { service: "Co-working", used: 15, total: null, unit: "khong gioi han" },
    { service: "Spa & Massage", used: 2, total: 4, unit: "lan/thang" },
    { service: "Phong hop", used: 3, total: 8, unit: "gio/thang" },
  ],
  family_members: [{ name: "Tran Thi C (vo)", status: "active" }],
};

export const MOCK_CHECKIN_HISTORY = [
  { timestamp: "2026-04-07 08:32", area: "Cong chinh", method: "QR", direction: "in" as const },
  { timestamp: "2026-04-07 17:45", area: "Cong chinh", method: "QR", direction: "out" as const },
  { timestamp: "2026-04-06 09:10", area: "Khu Spa", method: "The chip", direction: "in" as const },
  { timestamp: "2026-04-06 11:30", area: "Khu Spa", method: "The chip", direction: "out" as const },
  { timestamp: "2026-04-05 08:15", area: "Cong chinh", method: "QR", direction: "in" as const },
  { timestamp: "2026-04-05 18:00", area: "Cong chinh", method: "QR", direction: "out" as const },
];
