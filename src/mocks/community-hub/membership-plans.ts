// [FitPro] Mock data for FitPro Packages — 5 gói trải nghiệm 90 ngày
// Theo slide 9 pptx: Cơ bản → Plus → Pro → VIP → Super VIP

export const MOCK_MEMBERSHIP_PLANS = [
  {
    id: "FP-BASIC",
    name: "FitPro Cơ Bản",
    price: 2400000,
    duration_months: 3, // 90 ngày
    description: "Gói khởi đầu 90 ngày: 30 buổi tập + trà năng lượng + shake",
    color: "#8E9BAE",
    includes: [
      { service: "30 buổi tập tại trạm", quota: 30, unit: "buổi/90 ngày" },
      { service: "Trà năng lượng", quota: 30, unit: "ly" },
      { service: "Shake protein", quota: 30, unit: "ly" },
    ],
  },
  {
    id: "FP-PLUS",
    name: "FitPro Plus",
    price: 3600000,
    duration_months: 3,
    description: "Cơ bản + Cấp nước điện giải (hydrate)",
    color: "#4DE4C4",
    includes: [
      { service: "30 buổi tập tại trạm", quota: 30, unit: "buổi/90 ngày" },
      { service: "Trà năng lượng", quota: 30, unit: "ly" },
      { service: "Shake protein", quota: 30, unit: "ly" },
      { service: "Cấp nước (Hydrate)", quota: 30, unit: "ly" },
    ],
  },
  {
    id: "FP-PRO",
    name: "FitPro Pro",
    price: 5200000,
    duration_months: 3,
    description: "Plus + Phục hồi cơ bắp sau tập",
    color: "#00C9A7",
    popular: true,
    includes: [
      { service: "30 buổi tập tại trạm", quota: 30, unit: "buổi/90 ngày" },
      { service: "Trà năng lượng", quota: 30, unit: "ly" },
      { service: "Shake protein", quota: 30, unit: "ly" },
      { service: "Cấp nước (Hydrate)", quota: 30, unit: "ly" },
      { service: "Phục hồi cơ bắp", quota: 30, unit: "liều" },
    ],
  },
  {
    id: "FP-VIP",
    name: "FitPro VIP",
    price: 8500000,
    duration_months: 3,
    description: "Gói KHỞI NGHIỆP CHUẨN — Pro + Bảo vệ xương khớp + Xét nghiệm y tế Medlatec",
    color: "#FF8C42",
    badge: "Khởi nghiệp chuẩn",
    includes: [
      { service: "30 buổi tập tại trạm", quota: 30, unit: "buổi/90 ngày" },
      { service: "Trà năng lượng", quota: 30, unit: "ly" },
      { service: "Shake protein", quota: 30, unit: "ly" },
      { service: "Cấp nước (Hydrate)", quota: 30, unit: "ly" },
      { service: "Phục hồi cơ bắp", quota: 30, unit: "liều" },
      { service: "Bảo vệ xương khớp & tim mạch", quota: 90, unit: "viên" },
      { service: "Xét nghiệm y tế (Medlatec)", quota: 2, unit: "lần (trước & sau)" },
    ],
  },
  {
    id: "FP-SUPER",
    name: "FitPro Super VIP",
    price: 10500000,
    duration_months: 3,
    description: "Full trải nghiệm premium — bao gồm quà tặng E-Gift",
    color: "#E8473B",
    badge: "Premium",
    includes: [
      { service: "30 buổi tập tại trạm", quota: 30, unit: "buổi/90 ngày" },
      { service: "Trà năng lượng", quota: 30, unit: "ly" },
      { service: "Shake protein", quota: 30, unit: "ly" },
      { service: "Cấp nước (Hydrate)", quota: 30, unit: "ly" },
      { service: "Phục hồi cơ bắp", quota: 30, unit: "liều" },
      { service: "Bảo vệ xương khớp & tim mạch", quota: 90, unit: "viên" },
      { service: "Xét nghiệm y tế (Medlatec)", quota: 2, unit: "lần" },
      { service: "Quà tặng E-Gift", quota: 1, unit: "gift" },
      { service: "Concierge 1-1 với Master Trainer", quota: 3, unit: "buổi" },
    ],
  },
];

export const MOCK_PAYMENT_METHODS = [
  { id: "PAY-01", name: "Tiền mặt tại trạm", icon: "cash" },
  { id: "PAY-02", name: "Chuyển khoản (VietQR)", icon: "bank" },
  { id: "PAY-03", name: "Thẻ tín dụng", icon: "card" },
  { id: "PAY-04", name: "Ví MoMo / ZaloPay", icon: "momo" },
];
