// ---- Kết nối đối tác vận chuyển ----
export interface IShippingPartnerConnectRequest {
  partnerId: number; // GHTK=1, Viettel Post=2, GHN=3
  apiKey: string;
  token?: string;
}

export interface IShippingPartnerFilterRequest {
  keyword?: string;
  status?: number; // 0: chưa kết nối, 1: đã kết nối
  page?: number;
  limit?: number;
}

// ---- Cấu hình phí vận chuyển ----
export interface IShippingFeeConfigRequest {
  id?: number;
  feeByWeight?: boolean;
  weightFrom?: number;   // gram
  weightTo?: number;     // gram
  weightFee?: number;    // VND
  feeByRegion?: boolean;
  regionId?: number;
  regionFee?: number;    // VND
  flatRate?: boolean;
  flatRateFee?: number;  // VND
  branchId?: number;
}

// ---- Tạo đơn vận chuyển ----
export interface IShippingOrderCreateRequest {
  id?: number;
  salesOrderId?: number;       // ID đơn hàng bán (liên kết auto-fill)
  partnerId: number;
  invoiceId: number;           // ID hóa đơn
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverProvinceId?: number;
  receiverDistrictId?: number;
  receiverWardId?: number;
  weight: number;              // gram
  width?: number;              // cm
  height?: number;             // cm
  length?: number;             // cm
  codAmount?: number;          // Số tiền thu hộ (COD)
  note?: string;
  serviceTypeId?: number;
  insuranceValue?: number;
}

// ---- Lọc danh sách đơn vận chuyển ----
export interface IShippingOrderFilterRequest {
  keyword?: string;             // Tìm theo mã vận đơn, tên KH, SĐT
  status?: string;              // pending | in_transit | delivered | returned
  partnerId?: number;
  branchId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

// ---- Cập nhật trạng thái đơn hàng ----
export interface IShippingOrderUpdateStatusRequest {
  id: number;
  trackingCode: string;
  status: string;
  note?: string;
}

// ---- Xử lý hàng loạt ----
export interface IShippingBulkActionRequest {
  lstId: string;               // danh sách ID phân cách dấu phẩy
  action: "print" | "push" | "cancel";
  partnerId?: number;
}

// ---- Lọc báo cáo vận chuyển ----
export interface IShippingReportFilterRequest {
  partnerId?: number;
  branchId?: number;
  fromDate?: string;
  toDate?: string;
  groupBy?: "day" | "week" | "month";
  page?: number;
  limit?: number;
}