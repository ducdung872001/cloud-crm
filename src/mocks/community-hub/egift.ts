// [FitPro Phase 2.2] EGIFT — quà tặng Phygital cá nhân hoá
// URD: docs/urd/part-15-fitpro-phygital-roadmap.md#ur-fitpro-egift

export type GiftType = "physical" | "digital";
export type GiftStatus = "queued" | "shipped" | "claimed" | "expired";
export type TriggerMilestone =
  | "baseline_done"
  | "month_1_complete"
  | "retest_done"
  | "package_renewed"
  | "birthday"
  | "referral_success"
  | "first_checkin";

export interface GiftCatalogItem {
  id: string;
  name: string;
  type: GiftType;
  description: string;
  imageUrl?: string;
  valueVnd: number;
  triggerMilestone: TriggerMilestone;
  stockQty: number;      // cho physical
  digitalContent?: string; // cho digital: voucher code / link content / session id
  isActive: boolean;
}

export interface GiftAssignment {
  id: string;
  giftId: string;
  giftName: string;
  giftType: GiftType;
  memberId: string;
  memberName: string;
  triggerMilestone: TriggerMilestone;
  assignedAt: string;
  status: GiftStatus;
  shippedAt?: string;
  claimedAt?: string;
  trackingNumber?: string; // cho ship physical
}

export const MOCK_GIFT_CATALOG: GiftCatalogItem[] = [
  {
    id: "GIFT-001",
    name: "Áo thun FitPro Signature",
    type: "physical",
    description: "Áo thun thể thao màu xanh navy in logo FitPro, tặng cho hội viên hoàn tất Baseline Medlatec",
    valueVnd: 250000,
    triggerMilestone: "baseline_done",
    stockQty: 120,
    isActive: true,
  },
  {
    id: "GIFT-002",
    name: "Bình nước nhôm 750ml",
    type: "physical",
    description: "Bình nước giữ nhiệt logo FitPro — tặng hội viên hoàn thành tháng đầu tiên",
    valueVnd: 180000,
    triggerMilestone: "month_1_complete",
    stockQty: 200,
    isActive: true,
  },
  {
    id: "GIFT-003",
    name: "Ebook: 90 ngày đổi vóc dáng",
    type: "digital",
    description: "Ebook PDF 150 trang hướng dẫn dinh dưỡng + tập luyện theo mô hình FitPro",
    valueVnd: 0,
    triggerMilestone: "first_checkin",
    stockQty: 99999,
    digitalContent: "https://cdn.fitpro.reborn.vn/ebook/90-day-transform.pdf",
    isActive: true,
  },
  {
    id: "GIFT-004",
    name: "Voucher 30% gói kế tiếp",
    type: "digital",
    description: "Mã voucher giảm giá 30% cho gói FitPro tiếp theo — tặng khi hoàn thành re-test và đạt kết quả",
    valueVnd: 720000,
    triggerMilestone: "retest_done",
    stockQty: 99999,
    digitalContent: "VOUCHER-RENEW-30",
    isActive: true,
  },
  {
    id: "GIFT-005",
    name: "1 buổi tư vấn 1-1 với Chuyên gia dinh dưỡng",
    type: "digital",
    description: "60 phút tư vấn dinh dưỡng cá nhân hoá với chuyên gia Herbalife — tặng khi renew gói",
    valueVnd: 500000,
    triggerMilestone: "package_renewed",
    stockQty: 50,
    digitalContent: "BOOKING-SESSION-NUTRITION",
    isActive: true,
  },
  {
    id: "GIFT-006",
    name: "Bánh kem + hoa chúc mừng sinh nhật",
    type: "physical",
    description: "Quà sinh nhật dành cho hội viên VIP — giao tận trạm sáng hôm đó",
    valueVnd: 350000,
    triggerMilestone: "birthday",
    stockQty: 30,
    isActive: true,
  },
];

export const MOCK_GIFT_ASSIGNMENTS: GiftAssignment[] = [
  {
    id: "ASSIGN-001",
    giftId: "GIFT-001",
    giftName: "Áo thun FitPro Signature",
    giftType: "physical",
    memberId: "M-0132",
    memberName: "Lê Thị Mai",
    triggerMilestone: "baseline_done",
    assignedAt: "2026-03-25T08:00:00+07:00",
    status: "claimed",
    shippedAt: "2026-03-26T10:00:00+07:00",
    claimedAt: "2026-03-28T14:00:00+07:00",
    trackingNumber: "VTP-2026-1234",
  },
  {
    id: "ASSIGN-002",
    giftId: "GIFT-002",
    giftName: "Bình nước nhôm 750ml",
    giftType: "physical",
    memberId: "M-0132",
    memberName: "Lê Thị Mai",
    triggerMilestone: "month_1_complete",
    assignedAt: "2026-04-20T08:00:00+07:00",
    status: "shipped",
    shippedAt: "2026-04-21T09:00:00+07:00",
    trackingNumber: "VTP-2026-1289",
  },
  {
    id: "ASSIGN-003",
    giftId: "GIFT-003",
    giftName: "Ebook: 90 ngày đổi vóc dáng",
    giftType: "digital",
    memberId: "M-0245",
    memberName: "Trần Văn Thành",
    triggerMilestone: "first_checkin",
    assignedAt: "2026-03-22T09:15:00+07:00",
    status: "claimed",
    claimedAt: "2026-03-22T10:00:00+07:00",
  },
  {
    id: "ASSIGN-004",
    giftId: "GIFT-004",
    giftName: "Voucher 30% gói kế tiếp",
    giftType: "digital",
    memberId: "M-0099",
    memberName: "Nguyễn An",
    triggerMilestone: "retest_done",
    assignedAt: "2026-04-23T16:00:00+07:00",
    status: "queued",
  },
];

export const EGIFT_STATS = {
  catalogCount: MOCK_GIFT_CATALOG.length,
  activeCount: MOCK_GIFT_CATALOG.filter((g) => g.isActive).length,
  totalStockQty: MOCK_GIFT_CATALOG.reduce((a, g) => a + (g.type === "physical" ? g.stockQty : 0), 0),
  assignedThisMonth: MOCK_GIFT_ASSIGNMENTS.length,
  shippedThisMonth: MOCK_GIFT_ASSIGNMENTS.filter((a) => a.status === "shipped").length,
  claimedThisMonth: MOCK_GIFT_ASSIGNMENTS.filter((a) => a.status === "claimed").length,
  totalGiftValueVnd: MOCK_GIFT_CATALOG.reduce((a, g) => a + g.valueVnd * g.stockQty, 0),
};

export const MILESTONE_LABELS: Record<TriggerMilestone, string> = {
  baseline_done: "Hoàn tất Baseline Medlatec",
  month_1_complete: "Hoàn tất tháng 1",
  retest_done: "Hoàn tất Re-test (ngày 28-30)",
  package_renewed: "Gia hạn gói",
  birthday: "Sinh nhật hội viên",
  referral_success: "Giới thiệu thành công (hội viên mới mua gói)",
  first_checkin: "Lần check-in đầu tiên",
};
