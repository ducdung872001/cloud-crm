// [FitPro] 5 tier gói trải nghiệm — giá chuẩn 11/05/2026 theo bảng pricing chiến lược.
// Mỗi gói 30 buổi × giá/buổi. Tier ≥ PRO mở quyền Elite Member; gói ≥30 buổi mở quyền VIP Member;
// Medlatec lab chỉ kèm VIP / SUPER VIP. Xem docs/fitpro/03-architecture/business-model.md §3.3.

export interface IMembershipPlan {
  id: string;
  name: string;
  tier_code: "BASIC" | "PLUS" | "PRO" | "VIP" | "SUPER_VIP";
  price_per_session: number;
  sessions: number;
  price: number;
  duration_months: number;
  description: string;
  color: string;
  badge?: string;
  popular?: boolean;
  unlocks_elite?: boolean;      // PRO trở lên → quyền Elite (kinh doanh, gửi khách toàn quốc)
  includes_medlatec?: boolean;  // chỉ VIP / SUPER VIP
  includes: { service: string; quota: number; unit: string }[];
}

export const MOCK_MEMBERSHIP_PLANS: IMembershipPlan[] = [
  {
    id: "FP-BASIC",
    name: "FitPro BASIC",
    tier_code: "BASIC",
    price_per_session: 80_000,
    sessions: 30,
    price: 2_400_000,
    duration_months: 3,
    description: "Penetration tier — 80k ≈ 1 ly cà phê specialty, loại bỏ rào cản chạm thử",
    color: "#8E9BAE",
    includes: [
      { service: "30 buổi tập tại trạm", quota: 30, unit: "buổi/90 ngày" },
      { service: "Trà NRG (năng lượng sạch)", quota: 30, unit: "ly" },
      { service: "F1 Sport Shake", quota: 30, unit: "ly" },
    ],
  },
  {
    id: "FP-PLUS",
    name: "FitPro PLUS",
    tier_code: "PLUS",
    price_per_session: 140_000,
    sessions: 30,
    price: 4_200_000,
    duration_months: 3,
    description: "BASIC + Hydrate — bù khoáng/điện giải chuyên sâu",
    color: "#4DE4C4",
    includes: [
      { service: "30 buổi tập tại trạm", quota: 30, unit: "buổi/90 ngày" },
      { service: "Trà NRG", quota: 30, unit: "ly" },
      { service: "F1 Sport Shake", quota: 30, unit: "ly" },
      { service: "Hydrate (điện giải)", quota: 30, unit: "ly" },
    ],
  },
  {
    id: "FP-PRO",
    name: "FitPro PRO",
    tier_code: "PRO",
    price_per_session: 260_000,
    sessions: 30,
    price: 7_800_000,
    duration_months: 3,
    description: "PLUS + Rebuild Strength — phục hồi cơ thần tốc · Cổng mở quyền Elite Member (kinh doanh, gửi khách toàn quốc)",
    color: "#00C9A7",
    popular: true,
    unlocks_elite: true,
    badge: "Cổng Elite",
    includes: [
      { service: "30 buổi tập tại trạm", quota: 30, unit: "buổi/90 ngày" },
      { service: "Trà NRG", quota: 30, unit: "ly" },
      { service: "F1 Sport Shake", quota: 30, unit: "ly" },
      { service: "Hydrate (điện giải)", quota: 30, unit: "ly" },
      { service: "Rebuild Strength (phục hồi cơ)", quota: 30, unit: "liều" },
    ],
  },
  {
    id: "FP-VIP",
    name: "FitPro VIP",
    tier_code: "VIP",
    price_per_session: 315_000,
    sessions: 30,
    price: 9_450_000,
    duration_months: 3,
    description: "PRO + Xtra-Cal + Herbalifeline — tối ưu xương khớp, tim mạch · Kèm xét nghiệm Medlatec trước/sau",
    color: "#FF8C42",
    badge: "Premium + Medlatec",
    unlocks_elite: true,
    includes_medlatec: true,
    includes: [
      { service: "30 buổi tập tại trạm", quota: 30, unit: "buổi/90 ngày" },
      { service: "Trà NRG", quota: 30, unit: "ly" },
      { service: "F1 Sport Shake", quota: 30, unit: "ly" },
      { service: "Hydrate", quota: 30, unit: "ly" },
      { service: "Rebuild Strength", quota: 30, unit: "liều" },
      { service: "Xtra-Cal (xương khớp)", quota: 90, unit: "viên" },
      { service: "Herbalifeline (tim mạch)", quota: 90, unit: "viên" },
      { service: "Xét nghiệm Medlatec (trước & sau)", quota: 2, unit: "lần" },
    ],
  },
  {
    id: "FP-SUPER",
    name: "FitPro SUPER VIP",
    tier_code: "SUPER_VIP",
    price_per_session: 500_000,
    sessions: 30,
    price: 15_000_000,
    duration_months: 3,
    description: "VIP + Joint Support + Niteworks — vận động đỉnh cao, phục hồi sâu · Concierge 1-1 với Master Trainer",
    color: "#E8473B",
    badge: "Đỉnh cao",
    unlocks_elite: true,
    includes_medlatec: true,
    includes: [
      { service: "30 buổi tập tại trạm", quota: 30, unit: "buổi/90 ngày" },
      { service: "Trà NRG", quota: 30, unit: "ly" },
      { service: "F1 Sport Shake", quota: 30, unit: "ly" },
      { service: "Hydrate", quota: 30, unit: "ly" },
      { service: "Rebuild Strength", quota: 30, unit: "liều" },
      { service: "Xtra-Cal + Herbalifeline", quota: 90, unit: "viên" },
      { service: "Joint Support (khớp sâu)", quota: 90, unit: "viên" },
      { service: "Niteworks (phục hồi đêm)", quota: 90, unit: "viên" },
      { service: "Xét nghiệm Medlatec (trước & sau)", quota: 2, unit: "lần" },
      { service: "Concierge 1-1 Master Trainer", quota: 3, unit: "buổi" },
    ],
  },
];

export const MOCK_PAYMENT_METHODS = [
  { id: "PAY-01", name: "Tiền mặt tại trạm", icon: "cash" },
  { id: "PAY-02", name: "Chuyển khoản (VietQR)", icon: "bank" },
  { id: "PAY-03", name: "Thẻ tín dụng", icon: "card" },
  { id: "PAY-04", name: "Ví MoMo / ZaloPay", icon: "momo" },
];
