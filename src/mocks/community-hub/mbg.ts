// [FitPro Phase 2.1] Money-Back Guarantee — mock data
// Cam kết hoàn tiền 30 ngày nếu hội viên không đạt ngưỡng kết quả.
// URD: docs/urd/part-15-fitpro-phygital-roadmap.md#ur-fitpro-mbg

export type MBGClaimStatus =
  | "eligible"      // đã đủ điều kiện claim (ngày 30 + chưa đạt kết quả)
  | "submitted"     // hội viên đã submit claim
  | "reviewing"     // admin đang review
  | "approved"      // đã duyệt hoàn tiền
  | "rejected"      // từ chối (có kết quả thực tế, hoặc bằng chứng không đạt)
  | "refunded";     // đã hoàn tiền xong

export interface MBGRule {
  tenantId: string;
  // Ngưỡng kết quả — hội viên ĐẠT 1 trong 3 điều kiện là KHÔNG được claim
  thresholdWeightLossPct: number;   // VD 3 → giảm ≥ 3% cân nặng là có kết quả
  thresholdBodyFatDropPct: number;  // VD 2 → giảm ≥ 2 điểm % body fat
  thresholdBmiDrop: number;          // VD 1 → giảm ≥ 1 đơn vị BMI
  // Cửa sổ claim (ngày kể từ ngày mua gói)
  windowFromDay: number;             // VD 28
  windowToDay: number;               // VD 32
  // Quỹ
  reserveFundId: string;             // "MBG-Reserve"
  reservePctOfPackage: number;       // VD 10 → trạm dự phòng 10% giá gói vào MBG reserve
}

export interface MBGClaim {
  id: string;
  memberId: string;
  memberName: string;
  packageId: string;
  packageName: string;
  packagePriceVnd: number;
  stationCode: string;
  purchaseDate: string;              // ISO
  claimDate?: string;                // ISO — khi hội viên submit
  status: MBGClaimStatus;
  // Snapshot metrics
  baselineWeightKg: number;
  currentWeightKg: number;
  baselineBodyFatPct: number;
  currentBodyFatPct: number;
  baselineBmi: number;
  currentBmi: number;
  // Reason + evidence
  memberReason?: string;
  reviewerNote?: string;
  reviewerId?: string;
  refundAmountVnd?: number;
  refundedAt?: string;
  // Evaluate (có đạt ngưỡng không)
  metWeightTarget: boolean;
  metBodyFatTarget: boolean;
  metBmiTarget: boolean;
}

export const MOCK_MBG_RULE: MBGRule = {
  tenantId: "FITPRO",
  thresholdWeightLossPct: 3,
  thresholdBodyFatDropPct: 2,
  thresholdBmiDrop: 1,
  windowFromDay: 28,
  windowToDay: 32,
  reserveFundId: "MBG-Reserve",
  reservePctOfPackage: 10,
};

export const MOCK_MBG_CLAIMS: MBGClaim[] = [
  {
    id: "MBG-001",
    memberId: "M-0132",
    memberName: "Lê Thị Mai",
    packageId: "PKG-VIP-30",
    packageName: "FitPro VIP — 30 buổi",
    packagePriceVnd: 2400000,
    stationCode: "FP-HN-001",
    purchaseDate: "2026-03-20",
    claimDate: "2026-04-22",
    status: "reviewing",
    baselineWeightKg: 72.0,
    currentWeightKg: 71.5, // chỉ giảm 0.7% — dưới ngưỡng 3%
    baselineBodyFatPct: 28.0,
    currentBodyFatPct: 27.5, // chỉ giảm 0.5 điểm — dưới 2
    baselineBmi: 27.8,
    currentBmi: 27.6, // giảm 0.2 — dưới 1
    memberReason: "Đã tập đều 3 buổi/tuần, ăn theo hướng dẫn dinh dưỡng nhưng cân nặng không giảm.",
    metWeightTarget: false,
    metBodyFatTarget: false,
    metBmiTarget: false,
  },
  {
    id: "MBG-002",
    memberId: "M-0157",
    memberName: "Phạm Quang Huy",
    packageId: "PKG-VIP-30",
    packageName: "FitPro VIP — 30 buổi",
    packagePriceVnd: 2400000,
    stationCode: "FP-HN-002",
    purchaseDate: "2026-03-15",
    claimDate: "2026-04-15",
    status: "rejected",
    baselineWeightKg: 85.0,
    currentWeightKg: 81.2, // giảm 4.5% — ĐẠT
    baselineBodyFatPct: 32.0,
    currentBodyFatPct: 29.0, // giảm 3 điểm — ĐẠT
    baselineBmi: 29.4,
    currentBmi: 28.1,
    memberReason: "Muốn thử hoàn tiền",
    reviewerNote: "Đã đạt ngưỡng cân nặng (4.5%) và body fat (3 điểm) — claim không hợp lệ.",
    reviewerId: "ADMIN-001",
    metWeightTarget: true,
    metBodyFatTarget: true,
    metBmiTarget: true,
  },
  {
    id: "MBG-003",
    memberId: "M-0201",
    memberName: "Nguyễn Thu Trang",
    packageId: "PKG-VIP-30",
    packageName: "FitPro VIP — 30 buổi",
    packagePriceVnd: 2400000,
    stationCode: "FP-DN-001",
    purchaseDate: "2026-03-10",
    claimDate: "2026-04-10",
    status: "approved",
    baselineWeightKg: 68.0,
    currentWeightKg: 67.2, // giảm 1.2% — KHÔNG đạt
    baselineBodyFatPct: 30.0,
    currentBodyFatPct: 29.5, // giảm 0.5 — KHÔNG đạt
    baselineBmi: 26.6,
    currentBmi: 26.3,
    memberReason: "Tập đều nhưng không thấy giảm cân rõ.",
    reviewerNote: "Xác nhận hội viên tập đủ buổi, Medlatec re-test cho thấy không đạt ngưỡng. Duyệt hoàn tiền.",
    reviewerId: "ADMIN-001",
    refundAmountVnd: 2400000,
    metWeightTarget: false,
    metBodyFatTarget: false,
    metBmiTarget: false,
  },
  {
    id: "MBG-004",
    memberId: "M-0245",
    memberName: "Trần Văn Thành",
    packageId: "PKG-BASIC-15",
    packageName: "FitPro Basic — 15 buổi",
    packagePriceVnd: 1200000,
    stationCode: "FP-HN-001",
    purchaseDate: "2026-03-22",
    status: "eligible", // sắp đến cửa sổ claim
    baselineWeightKg: 78.0,
    currentWeightKg: 77.4,
    baselineBodyFatPct: 29.0,
    currentBodyFatPct: 28.7,
    baselineBmi: 28.0,
    currentBmi: 27.8,
    metWeightTarget: false,
    metBodyFatTarget: false,
    metBmiTarget: false,
  },
];

export const MBG_STATS = {
  reserveBalanceVnd: 18500000,       // quỹ MBG đang giữ
  pendingReviewCount: 1,
  thisMonthApprovedCount: 1,
  thisMonthApprovedVnd: 2400000,
  thisMonthRejectedCount: 1,
  memberActiveCount: 46,              // số hội viên đang trong cửa sổ MBG
  eligibleCount: 1,                   // hội viên đủ điều kiện claim mà chưa submit
};
