// ---- Đối tác vận chuyển ----
export interface IShippingPartnerResponse {
  id: number;
  name: string;         // GHTK | Viettel Post | GHN
  logo?: string;
  status: number;       // 0: chưa kết nối, 1: đã kết nối
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

// ---- Đơn vận chuyển ----
export interface IShippingOrderResponse {
  id: number;
  trackingCode: string;         // Mã vận đơn từ hãng VC
  salesOrderId?: number;
  salesOrderCode?: string;
  partnerId: number;
  partnerName: string;          // GHTK | Viettel Post | GHN
  partnerLogo?: string;

  // Thông tin người nhận
  receiverName: string;
  receiverPhone: string;
  receiverPhoneMasked?: string;
  receiverAddress: string;
  receiverProvinceName?: string;
  receiverDistrictName?: string;
  receiverWardName?: string;

  // Chi tiết hàng hóa
  weight: number;               // gram
  width?: number;               // cm
  height?: number;              // cm
  length?: number;              // cm
  codAmount?: number;           // Số tiền thu hộ
  insuranceValue?: number;
  shippingFee?: number;         // Phí ship

  // Trạng thái
  status: string;               // pending | in_transit | delivered | returned | cancelled
  statusName?: string;          // Tên trạng thái tiếng Việt
  note?: string;

  // Nhân viên / chi nhánh
  employeeId?: number;
  employeeName?: string;
  branchId?: number;
  branchName?: string;

  // Lịch sử vận chuyển
  trackingHistory?: IShippingTrackingHistoryResponse[];
  shipperName?: string;
  shipperPhone?: string;

  createdTime: string;
  updatedTime?: string;
}

// ---- Lịch sử theo dõi đơn hàng ----
export interface IShippingTrackingHistoryResponse {
  id: number;
  shippingOrderId: number;
  status: string;
  statusName: string;
  location?: string;
  note?: string;
  timestamp: string;            // Thời gian thực - time-stamped node
}

// ---- Thống kê / báo cáo vận chuyển ----
export interface IShippingReportSummaryResponse {
  totalOrders: number;
  pendingOrders: number;        // Chờ lấy hàng
  inTransitOrders: number;      // Đang giao
  deliveredOrders: number;      // Đã giao
  returnedOrders: number;       // Hoàn hàng / Hủy
  totalCodAmount: number;
  totalShippingFee: number;
  successRate: number;          // % giao thành công
}

export interface IShippingReportItemResponse {
  date: string;
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  codAmount: number;
  shippingFee: number;
}