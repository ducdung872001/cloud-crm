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
  startTime?: string;       // ISO datetime "YYYY-MM-DDTHH:mm:ss"
  endTime?: string;
  applyType?: number;       // 1=đạt tối thiểu, 2=đạt trên mỗi khoảng
  minAmount?: number;       // Giá trị đơn hàng tối thiểu
  perAmount?: number;
  promotionType?: number;   // 1=Giảm giá, 2=Flash Sale, 3=Sự kiện, 4=Sinh nhật, 5=Theo mùa
  discount?: number;        // Giá trị giảm (% hoặc VND)
  discountType?: number;    // 1=%, 2=VND cố định
  status?: number;          // 0=Chờ duyệt, 1=Đang chạy, 2=Hết hạn, 3=Tạm dừng
  employeeId?: number;
  branchId?: number;
  bsnId?: number;
  input?: string;
  output?: string;
  businessRuleId?: number;
  // ---- 3 trường đề xuất thêm vào DB ----
  mode?: number;            // 1=Direction(trực tiếp), 2=DMN Rule
  budget?: number;          // Ngân sách tối đa (VND)
  usedCount?: number;       // Số lượt đã dùng (read-only từ BE)
}

/**
 * Request tạo/cập nhật chương trình khuyến mãi
 */
export interface IPromotionRequest {
  id?: number;
  name: string;
  startTime: string;
  endTime: string;
  promotionType: number;
  discount: number;
  discountType: number;
  applyType?: number;
  minAmount?: number;
  perAmount?: number;
  budget?: number;
  mode?: number;
  businessRuleId?: number;
  input?: string;
  output?: string;
  status?: number;
}

/**
 * Query params cho API list
 */
export interface IPromotionListParams {
  name?: string;
  fmtStartDate?: string;    // "dd/MM/yyyy" hoặc "yyyy-MM-dd"
  fmtEndDate?: string;
  status?: number;          // -1 = tất cả
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
};

/** Map status number → label + className badge */
export const PROMOTION_STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Chờ duyệt",  className: "promo-badge promo-badge--pending" },
  1: { label: "Đang chạy",  className: "promo-badge promo-badge--active"  },
  2: { label: "Hết hạn",    className: "promo-badge promo-badge--expired" },
  3: { label: "Tạm dừng",   className: "promo-badge promo-badge--paused"  },
};