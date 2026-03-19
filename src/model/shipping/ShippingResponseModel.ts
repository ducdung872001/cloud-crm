// ---- Đơn vận chuyển (map theo API response thực tế) ----
export interface IShippingOrderResponse {
  id: number;
  shipmentOrder: string;           // "SHIP240101-002" - Mã đơn nội bộ
  bsnId: number;
  orderId: number;                 // ID đơn hàng bán liên kết
  orderCode: string;               // "ORD-2024-401"

  // Hãng vận chuyển
  carrierCode: string;             // "GHN" | "GHTK" | "VTP"
  carrierName: string;             // "Giao Hàng Nhanh"
  carrierTrackingCode: string;     // Mã vận đơn từ hãng "GHN1121223456789"
  carrierServiceCode?: string;     // "CHUAN"

  // Người gửi
  senderName: string;
  senderPhone: string;
  senderAddress: string;

  // Người nhận
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;

  // Kích thước & trọng lượng
  weightGram: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;

  noteForShipper?: string;

  // Phí
  carrierFee: number;
  platformShippingDiscountAmount?: number;
  bsnShippingDiscountAmount?: number;
  shippingFee: number;             // Phí ship thực thu

  platformOrderDiscountAmount?: number;
  bsnOrderDiscountAmount?: number;
  orderSubtotalAmount?: number;
  totalAmount?: number;

  // COD
  codAmount?: number;
  codCollectedAt?: string | null;
  codTransferredAt?: string | null;

  // Trạng thái
  statusCode: string;              // "SUBMITTED" | "PENDING" | "IN_TRANSIT" | "DELIVERED" | "RETURNED" | "CANCELLED"

  failedAttemptCount?: number;
  failedReason?: string | null;
  lastCarrierEventId?: string | null;

  // Mốc thời gian
  expectedPickupDate?: string;
  expectedDeliveryDate?: string;
  submittedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  returnedAt?: string | null;
  cancelledAt?: string | null;

  // Audit
  createdBy?: number;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;

  // Lịch sử tracking (load riêng)
  trackingHistory?: IShippingTrackingHistoryResponse[];
}

// ---- Lịch sử theo dõi đơn hàng ----
export interface IShippingTrackingHistoryResponse {
  id: number;
  shippingOrderId: number;
  status: string;
  statusName: string;
  location?: string;
  note?: string;
  timestamp: string;
}

// ---- Phân trang danh sách đơn ----
export interface IShippingOrderListResponse {
  items: IShippingOrderResponse[];
  total: number;
  page: number;
  totalPage: number;
  tabCounts: {
    pending: number;
    in_transit: number;
    delivered: number;
    returned: number;
  };
}

// ---- Đối tác vận chuyển ----
export interface IShippingPartnerResponse {
  id: number;
  name: string;
  logo?: string;
  status: number;
  webhookUrl?: string;
  connectedAt?: string;
}

// ---- Cấu hình phí vận chuyển ----
export interface IShippingFeeConfigResponse {
  id: number;
  feeByWeight: boolean;
  weightFrom?: number;
  weightTo?: number;
  weightFee?: number;
  feeByRegion: boolean;
  regionId?: number;
  regionName?: string;
  regionFee?: number;
  flatRate: boolean;
  flatRateFee?: number;
  branchId?: number;
  updatedTime?: string;
}

// ---- Thống kê / báo cáo vận chuyển ----
export interface IShippingReportSummaryResponse {
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  totalCodAmount: number;
  totalShippingFee: number;
  successRate: number;
}

export interface IShippingReportItemResponse {
  date: string;
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  codAmount: number;
  shippingFee: number;
}