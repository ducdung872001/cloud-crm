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
  shipmentOrder?: string;       // Lọc theo ID đơn vận chuyển cụ thể
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
// ---- Form state nội bộ màn Tạo / Chỉnh sửa đơn vận chuyển ----
export interface IShippingFormState {
  id?: number;
  // Người gửi
  senderEmployeeId: number | null;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderStreet: string;
  senderProvinceId: number | null;
  senderProvinceName: string;
  senderDistrictId: number | null;
  senderDistrict: string;
  senderWardCode: string;
  senderWard: string;
  // Hãng & hóa đơn
  partnerId: number | null;
  invoiceId: number | null;
  // Người nhận
  receiverName: string;
  receiverPhone: string;
  receiverStreet: string;
  receiverProvinceId: number | null;
  receiverProvinceName: string;
  receiverDistrictId: number | null;
  receiverDistrict: string;
  receiverWardCode: string;
  receiverWard: string;
  receiverEmail: string;
  // Hàng hóa
  weight: number | null;
  width: number | null;
  height: number | null;
  length: number | null;
  codAmount: number | null;
  note: string;
}