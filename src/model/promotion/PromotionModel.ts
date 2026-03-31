// =====================================================================
// FILE: src/model/promotion/PromotionModel.ts
// MỚI HOÀN TOÀN – thay thế src/model/voucher/VoucherList.ts (giữ lại
// VoucherList.ts nếu các module khác đang dùng IPromotion từ đó)
// =====================================================================

/**
 * Chương trình khuyến mãi – ánh xạ 1-1 với entity BE Promotion
 * + 3 cột mới đề xuất bổ sung DB: mode, budget, usedCount
 */
export interface IPromotion {
  id?: number;
  name?: string;
  startTime?: string;
  endTime?: string;
  applyType?: number;
  minAmount?: number;
  perAmount?: number;
  promotionType?: number;
  discount?: number;
  discountType?: number;
  status?: number;
  employeeId?: number;
  branchId?: number;
  bsnId?: number;
  input?: string;
  output?: string;
  businessRuleId?: number;
  mode?: number;
  budget?: number;
  usedCount?: number;
  slug?: string;
  /** Giá đồng giá (VND) — chỉ dùng khi promotionType = 7 */
  fixedPrice?: number;
}

export interface IPromotionRequest {
  id?: number;
  name: string;
  startTime: string;
  endTime: string;
  promotionType: number;
  discount?: number;
  discountType?: number;
  applyType?: number;
  minAmount?: number;
  perAmount?: number;
  budget?: number;
  mode?: number;
  businessRuleId?: number;
  input?: string;
  output?: string;
  status?: number;
  /** Giá đồng giá (VND) — chỉ required khi promotionType = 7 */
  fixedPrice?: number;
}

/** Sản phẩm tham gia CT đồng giá */
export interface IFixedPriceProduct {
  id?: number;
  promotionId?: number;
  productId: number;
  variantId?: number;
  productName?: string;
  avatar?: string;
  originalPrice?: number;
}

/** Entry đồng giá active — POS dùng để build lookup map */
export interface IFixedPriceEntry {
  productId: number;
  variantId?: number;
  productName?: string;
  avatar?: string;
  fixedPrice: number;
  promotionName?: string;
  promotionId?: number;
}

/**
 * Query params cho API list
 */
export interface IPromotionListParams {
  name?: string;
  fmtStartDate?: string;    // "dd/MM/yyyy" hoặc "yyyy-MM-dd"
  fmtEndDate?: string;
  status?: number;          // -1 = tất cả
  promotionType?: number;   // 0 = tất cả, 7 = đồng giá...
  page?: number;
  sizeLimit?: number;
}

/** Map promotionType number → label tiếng Việt */
export const PROMOTION_TYPE_LABELS: Record<number, string> = {
  1: "Giảm giá",
  2: "Flash Sale",
  3: "Sự kiện",
  4: "Sinh nhật",
  5: "Theo mùa",
  6: "Combo",
  7: "Đồng giá",
};

/** Map status number → label + className badge */
export const PROMOTION_STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Chờ duyệt",  className: "promo-badge promo-badge--pending" },
  1: { label: "Đang chạy",  className: "promo-badge promo-badge--active"  },
  2: { label: "Hết hạn",    className: "promo-badge promo-badge--expired" },
  3: { label: "Tạm dừng",   className: "promo-badge promo-badge--paused"  },
};