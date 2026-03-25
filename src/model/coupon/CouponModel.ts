// FILE MỚI: src/model/coupon/CouponModel.ts

/**
 * discountType: 1=Phần trăm, 2=Số tiền cố định, 3=Miễn ship
 * status:       0=Chờ duyệt, 1=Đang chạy, 2=Hết hạn, 3=Tạm dừng
 */
export interface ICoupon {
  id?:            number;
  code?:          string;
  discountType?:  number;
  discountValue?: number;
  minOrder?:      number;
  maxUses?:       number;
  usedCount?:     number;
  expiryDate?:    string;   // "YYYY-MM-DD"
  status?:        number;
  description?:   string;
  employeeId?:    number;
  branchId?:      number;
  bsnId?:         number;
  createdTime?:   string;
}

export interface ICouponRequest {
  id?:           number;
  code:          string;
  discountType:  number;
  discountValue: number;
  minOrder?:     number;
  maxUses?:      number;
  expiryDate:    string;
  status?:       number;
  description?:  string;
}

export interface ICouponListParams {
  code?:         string;
  status?:       number;   // -1=tất cả
  discountType?: number;   //  0=tất cả
  page?:         number;
  sizeLimit?:    number;
}

export const DISCOUNT_TYPE_LABELS: Record<number, string> = {
  1: "Phần trăm",
  2: "Số tiền",
  3: "Miễn ship",
};

export const COUPON_STATUS_MAP: Record<number, {
  label: string;
  badgeClass: string;
  headerClass: string;
  variant: "success"|"warning"|"error"|"secondary";
}> = {
  0: { label: "Chờ duyệt", badgeClass: "c-badge c-badge--pending", headerClass: "c-card-header--pending", variant: "warning"   },
  1: { label: "Đang chạy", badgeClass: "c-badge c-badge--active",  headerClass: "c-card-header--active",  variant: "success"   },
  2: { label: "Hết hạn",   badgeClass: "c-badge c-badge--expired", headerClass: "c-card-header--expired", variant: "error"     },
  3: { label: "Tạm dừng",  badgeClass: "c-badge c-badge--paused",  headerClass: "c-card-header--paused",  variant: "secondary" },
};

export const COUPON_STATUS_TRANSITIONS: Record<number, {status: number; label: string}[]> = {
  0: [{ status: 1, label: "Duyệt – Bắt đầu chạy" }, { status: 2, label: "Từ chối" }],
  1: [{ status: 3, label: "Tạm dừng" }],
  2: [],
  3: [{ status: 1, label: "Tiếp tục chạy" }, { status: 2, label: "Kết thúc" }],
};
