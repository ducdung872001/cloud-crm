// =============================================
// SHIPPING MOCK DATA
// Dùng tạm khi chưa có API thật
// Xóa file này và thay bằng ShippingService khi API sẵn sàng
// =============================================

import {
  IShippingOrderResponse,
  IShippingPartnerResponse,
  IShippingFeeConfigResponse,
  IShippingTrackingHistoryResponse,
  IShippingReportSummaryResponse,
} from "model/shipping/ShippingResponseModel";

// =============================================
// 1. ĐỐI TÁC VẬN CHUYỂN
// =============================================
export const MOCK_PARTNERS: IShippingPartnerResponse[] = [
  {
    id: 1,
    name: "GHTK",
    logo: "",
    status: 0, // chưa kết nối
    webhookUrl: "",
    connectedAt: "",
  },
  {
    id: 2,
    name: "Viettel Post",
    logo: "",
    status: 1, // đã kết nối
    webhookUrl: "https://webhook.example.com/viettelpost",
    connectedAt: "2024-03-01T10:00:00",
  },
  {
    id: 3,
    name: "GHN",
    logo: "",
    status: 0,
    webhookUrl: "",
    connectedAt: "",
  },
];

// =============================================
// 2. CẤU HÌNH PHÍ VẬN CHUYỂN
// =============================================
export const MOCK_FEE_CONFIG: IShippingFeeConfigResponse = {
  id: 1,
  feeByWeight: true,
  weightFrom: 0,
  weightTo: 1000, // gram
  weightFee: 25000,
  feeByRegion: true,
  regionId: 1,
  regionName: "Nội thành Hà Nội",
  regionFee: 15000,
  flatRate: true,
  flatRateFee: 30000,
  branchId: 1,
  updatedTime: "2024-05-01T08:00:00",
};

// =============================================
// 3. LỊCH SỬ TRACKING
// =============================================
export const MOCK_TRACKING_HISTORIES: Record<number, IShippingTrackingHistoryResponse[]> = {
  1: [
    {
      id: 1,
      shippingOrderId: 1,
      status: "in_transit",
      statusName: "Đơn hàng đang được giao",
      location: "Bưu cục Quận 1",
      note: "",
      timestamp: "2024-10-24T14:30:00",
    },
    {
      id: 2,
      shippingOrderId: 1,
      status: "picked_up",
      statusName: "Đã lấy hàng",
      location: "Kho trung tâm TP.HCM",
      note: "",
      timestamp: "2024-10-24T09:00:00",
    },
    {
      id: 3,
      shippingOrderId: 1,
      status: "pending",
      statusName: "Đơn hàng được tạo",
      location: "",
      note: "",
      timestamp: "2024-10-23T18:00:00",
    },
  ],
  2: [
    {
      id: 4,
      shippingOrderId: 2,
      status: "in_transit",
      statusName: "Đơn hàng đang được giao",
      location: "Bưu cục Hoàn Kiếm",
      note: "",
      timestamp: "2024-05-11T10:00:00",
    },
  ],
};

// =============================================
// 4. DANH SÁCH ĐƠN VẬN CHUYỂN (tất cả trạng thái)
// =============================================
export const MOCK_SHIPPING_ORDERS: IShippingOrderResponse[] = [
  // --- pending ---
  {
    id: 101,
    trackingCode: "VD4567891230",
    salesOrderId: 3001,
    salesOrderCode: "HD-3001",
    partnerId: 2,
    partnerName: "Viettel Post",
    receiverName: "Trần Tuấn Kiệt",
    receiverPhone: "090***3456",
    receiverPhoneMasked: "090***3456",
    receiverAddress: "45 Lê Lợi, Hoàn Kiếm, Hà Nội",
    receiverProvinceName: "Hà Nội",
    receiverDistrictName: "Hoàn Kiếm",
    weight: 800,
    codAmount: 350000,
    shippingFee: 25000,
    status: "pending",
    statusName: "Chờ lấy hàng",
    employeeName: "Nguyễn Thị Mai",
    branchName: "Chi nhánh HN",
    trackingHistory: [],
    createdTime: "2024-05-10T08:30:00",
    updatedTime: "2024-05-10T08:30:00",
  },
  {
    id: 102,
    trackingCode: "VD8901234560",
    salesOrderId: 3002,
    salesOrderCode: "HD-3002",
    partnerId: 1,
    partnerName: "GHTK",
    receiverName: "Phạm Thị Lan",
    receiverPhone: "098***7890",
    receiverPhoneMasked: "098***7890",
    receiverAddress: "12 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    receiverProvinceName: "Hà Nội",
    receiverDistrictName: "Thanh Xuân",
    weight: 500,
    codAmount: 0,
    shippingFee: 20000,
    status: "pending",
    statusName: "Chờ lấy hàng",
    employeeName: "Lê Văn Hùng",
    branchName: "Chi nhánh HN",
    trackingHistory: [],
    createdTime: "2024-05-10T10:00:00",
    updatedTime: "2024-05-10T10:00:00",
  },
  {
    id: 103,
    trackingCode: "VD2345678901",
    salesOrderId: 3003,
    salesOrderCode: "HD-3003",
    partnerId: 3,
    partnerName: "GHN",
    receiverName: "Hoàng Văn Nam",
    receiverPhone: "091***2345",
    receiverPhoneMasked: "091***2345",
    receiverAddress: "78 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM",
    receiverProvinceName: "TP.HCM",
    receiverDistrictName: "Bình Thạnh",
    weight: 1200,
    codAmount: 580000,
    shippingFee: 35000,
    status: "pending",
    statusName: "Chờ lấy hàng",
    employeeName: "Nguyễn Thị Mai",
    branchName: "Chi nhánh HCM",
    trackingHistory: [],
    createdTime: "2024-05-09T14:00:00",
    updatedTime: "2024-05-09T14:00:00",
  },
  {
    id: 104,
    trackingCode: "VD3344556677",
    salesOrderId: 3004,
    salesOrderCode: "HD-3004",
    partnerId: 2,
    partnerName: "Viettel Post",
    receiverName: "Bùi Thị Hạnh",
    receiverPhone: "093***6677",
    receiverPhoneMasked: "093***6677",
    receiverAddress: "22 Phan Chu Trinh, Hoàn Kiếm, Hà Nội",
    receiverProvinceName: "Hà Nội",
    receiverDistrictName: "Hoàn Kiếm",
    weight: 650,
    codAmount: 420000,
    shippingFee: 22000,
    status: "pending",
    statusName: "Chờ lấy hàng",
    employeeName: "Lê Văn Hùng",
    branchName: "Chi nhánh HN",
    trackingHistory: [],
    createdTime: "2024-05-11T07:45:00",
    updatedTime: "2024-05-11T07:45:00",
  },
  {
    id: 105,
    trackingCode: "VD5566778899",
    salesOrderId: 3005,
    salesOrderCode: "HD-3005",
    partnerId: 1,
    partnerName: "GHTK",
    receiverName: "Ngô Thanh Tùng",
    receiverPhone: "096***8899",
    receiverPhoneMasked: "096***8899",
    receiverAddress: "55 Lê Thánh Tông, Ngô Quyền, Hải Phòng",
    receiverProvinceName: "Hải Phòng",
    receiverDistrictName: "Ngô Quyền",
    weight: 300,
    codAmount: 175000,
    shippingFee: 28000,
    status: "pending",
    statusName: "Chờ lấy hàng",
    employeeName: "Trần Thị Kim",
    branchName: "Chi nhánh HN",
    trackingHistory: [],
    createdTime: "2024-05-11T09:10:00",
    updatedTime: "2024-05-11T09:10:00",
  },
  {
    id: 106,
    trackingCode: "VD6677889900",
    salesOrderId: 3006,
    salesOrderCode: "HD-3006",
    partnerId: 3,
    partnerName: "GHN",
    receiverName: "Đinh Văn Lực",
    receiverPhone: "089***9900",
    receiverPhoneMasked: "089***9900",
    receiverAddress: "10 Trường Chinh, Thanh Xuân, Hà Nội",
    receiverProvinceName: "Hà Nội",
    receiverDistrictName: "Thanh Xuân",
    weight: 950,
    codAmount: 0,
    shippingFee: 30000,
    status: "pending",
    statusName: "Chờ lấy hàng",
    employeeName: "Nguyễn Thị Mai",
    branchName: "Chi nhánh HN",
    trackingHistory: [],
    createdTime: "2024-05-11T11:00:00",
    updatedTime: "2024-05-11T11:00:00",
  },

  // --- in_transit ---
  {
    id: 1,
    trackingCode: "VD1234567890",
    salesOrderId: 2001,
    salesOrderCode: "HD-2001",
    partnerId: 2,
    partnerName: "Viettel Post",
    receiverName: "Nguyễn Văn Tùng",
    receiverPhone: "090***1234",
    receiverPhoneMasked: "090***1234",
    receiverAddress: "123 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội",
    receiverProvinceName: "Hà Nội",
    receiverDistrictName: "Hoàn Kiếm",
    weight: 500,
    width: 20,
    height: 15,
    length: 10,
    codAmount: 450000,
    shippingFee: 25000,
    status: "in_transit",
    statusName: "Đang giao",
    shipperName: "Lê Văn B",
    shipperPhone: "0912345678",
    employeeName: "Nguyễn Thị Mai",
    branchName: "Chi nhánh HN",
    trackingHistory: MOCK_TRACKING_HISTORIES[1],
    createdTime: "2024-05-12T08:00:00",
    updatedTime: "2024-10-24T14:30:00",
  },
  {
    id: 2,
    trackingCode: "VD9876543210",
    salesOrderId: 2002,
    salesOrderCode: "HD-2002",
    partnerId: 1,
    partnerName: "GHTK",
    receiverName: "Lê Thị Hoa",
    receiverPhone: "091***5678",
    receiverPhoneMasked: "091***5678",
    receiverAddress: "56 Bà Triệu, Hai Bà Trưng, Hà Nội",
    receiverProvinceName: "Hà Nội",
    receiverDistrictName: "Hai Bà Trưng",
    weight: 300,
    codAmount: 220000,
    shippingFee: 20000,
    status: "in_transit",
    statusName: "Đang giao",
    shipperName: "Trần Văn C",
    shipperPhone: "0987654321",
    employeeName: "Lê Văn Hùng",
    branchName: "Chi nhánh HN",
    trackingHistory: MOCK_TRACKING_HISTORIES[2],
    createdTime: "2024-05-11T09:00:00",
    updatedTime: "2024-05-11T10:00:00",
  },
  {
    id: 3,
    trackingCode: "VD5555123456",
    salesOrderId: 2003,
    salesOrderCode: "HD-2003",
    partnerId: 3,
    partnerName: "GHN",
    receiverName: "Võ Thị Bích",
    receiverPhone: "093***4567",
    receiverPhoneMasked: "093***4567",
    receiverAddress: "99 Nguyễn Huệ, Quận 1, TP.HCM",
    receiverProvinceName: "TP.HCM",
    receiverDistrictName: "Quận 1",
    weight: 750,
    codAmount: 0,
    shippingFee: 30000,
    status: "in_transit",
    statusName: "Đang giao",
    shipperName: "Phạm Văn D",
    shipperPhone: "0901112233",
    employeeName: "Trần Thị Kim",
    branchName: "Chi nhánh HCM",
    trackingHistory: [],
    createdTime: "2024-05-10T11:00:00",
    updatedTime: "2024-05-11T08:00:00",
  },
  {
    id: 7,
    trackingCode: "VD6611223344",
    salesOrderId: 2004,
    salesOrderCode: "HD-2004",
    partnerId: 2,
    partnerName: "Viettel Post",
    receiverName: "Phan Thị Ngọc",
    receiverPhone: "094***3344",
    receiverPhoneMasked: "094***3344",
    receiverAddress: "18 Cầu Giấy, Cầu Giấy, Hà Nội",
    receiverProvinceName: "Hà Nội",
    receiverDistrictName: "Cầu Giấy",
    weight: 420,
    codAmount: 195000,
    shippingFee: 22000,
    status: "in_transit",
    statusName: "Đang giao",
    shipperName: "Nguyễn Văn E",
    shipperPhone: "0903334455",
    employeeName: "Lê Văn Hùng",
    branchName: "Chi nhánh HN",
    trackingHistory: [],
    createdTime: "2024-05-12T06:30:00",
    updatedTime: "2024-05-12T09:00:00",
  },
  {
    id: 8,
    trackingCode: "VD7722334455",
    salesOrderId: 2005,
    salesOrderCode: "HD-2005",
    partnerId: 1,
    partnerName: "GHTK",
    receiverName: "Trịnh Văn Dương",
    receiverPhone: "097***4455",
    receiverPhoneMasked: "097***4455",
    receiverAddress: "30 Huỳnh Thúc Kháng, Đống Đa, Hà Nội",
    receiverProvinceName: "Hà Nội",
    receiverDistrictName: "Đống Đa",
    weight: 880,
    codAmount: 640000,
    shippingFee: 27000,
    status: "in_transit",
    statusName: "Đang giao",
    shipperName: "Hoàng Văn F",
    shipperPhone: "0924445566",
    employeeName: "Nguyễn Thị Mai",
    branchName: "Chi nhánh HN",
    trackingHistory: [],
    createdTime: "2024-05-11T14:00:00",
    updatedTime: "2024-05-12T07:30:00",
  },
  {
    id: 9,
    trackingCode: "VD8833445566",
    salesOrderId: 2006,
    salesOrderCode: "HD-2006",
    partnerId: 3,
    partnerName: "GHN",
    receiverName: "Lưu Thị Mai",
    receiverPhone: "098***5566",
    receiverPhoneMasked: "098***5566",
    receiverAddress: "7 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM",
    receiverProvinceName: "TP.HCM",
    receiverDistrictName: "Bình Thạnh",
    weight: 560,
    codAmount: 0,
    shippingFee: 29000,
    status: "in_transit",
    statusName: "Đang giao",
    shipperName: "Đỗ Văn G",
    shipperPhone: "0935556677",
    employeeName: "Trần Thị Kim",
    branchName: "Chi nhánh HCM",
    trackingHistory: [],
    createdTime: "2024-05-11T16:00:00",
    updatedTime: "2024-05-12T10:00:00",
  },

  // --- delivered ---
  {
    id: 4,
    trackingCode: "VD3216549870",
    salesOrderId: 1001,
    salesOrderCode: "HD-1001",
    partnerId: 2,
    partnerName: "Viettel Post",
    receiverName: "Phạm Minh Phương",
    receiverPhone: "094***8901",
    receiverPhoneMasked: "094***8901",
    receiverAddress: "34 Đinh Lễ, Hoàn Kiếm, Hà Nội",
    receiverProvinceName: "Hà Nội",
    receiverDistrictName: "Hoàn Kiếm",
    weight: 400,
    codAmount: 310000,
    shippingFee: 22000,
    status: "delivered",
    statusName: "Đã giao",
    employeeName: "Nguyễn Thị Mai",
    branchName: "Chi nhánh HN",
    trackingHistory: [],
    createdTime: "2024-05-09T07:00:00",
    updatedTime: "2024-05-09T16:30:00",
  },
  {
    id: 5,
    trackingCode: "VD7788990011",
    salesOrderId: 1002,
    salesOrderCode: "HD-1002",
    partnerId: 3,
    partnerName: "GHN",
    receiverName: "Đặng Thị Thu",
    receiverPhone: "097***3344",
    receiverPhoneMasked: "097***3344",
    receiverAddress: "20 Trần Hưng Đạo, Quận 1, TP.HCM",
    receiverProvinceName: "TP.HCM",
    receiverDistrictName: "Quận 1",
    weight: 600,
    codAmount: 0,
    shippingFee: 28000,
    status: "delivered",
    statusName: "Đã giao",
    employeeName: "Lê Văn Hùng",
    branchName: "Chi nhánh HCM",
    trackingHistory: [],
    createdTime: "2024-05-08T09:00:00",
    updatedTime: "2024-05-08T17:00:00",
  },
  {
    id: 10,
    trackingCode: "VD9944556677",
    salesOrderId: 1003,
    salesOrderCode: "HD-1003",
    partnerId: 1,
    partnerName: "GHTK",
    receiverName: "Cao Văn Thắng",
    receiverPhone: "096***6677",
    receiverPhoneMasked: "096***6677",
    receiverAddress: "88 Lạc Long Quân, Tây Hồ, Hà Nội",
    receiverProvinceName: "Hà Nội",
    receiverDistrictName: "Tây Hồ",
    weight: 720,
    codAmount: 480000,
    shippingFee: 24000,
    status: "delivered",
    statusName: "Đã giao",
    employeeName: "Trần Thị Kim",
    branchName: "Chi nhánh HN",
    trackingHistory: [],
    createdTime: "2024-05-07T08:30:00",
    updatedTime: "2024-05-07T15:00:00",
  },
  {
    id: 11,
    trackingCode: "VD1055667788",
    salesOrderId: 1004,
    salesOrderCode: "HD-1004",
    partnerId: 2,
    partnerName: "Viettel Post",
    receiverName: "Vũ Thị Lan Anh",
    receiverPhone: "093***7788",
    receiverPhoneMasked: "093***7788",
    receiverAddress: "14 Nguyễn Văn Cừ, Long Biên, Hà Nội",
    receiverProvinceName: "Hà Nội",
    receiverDistrictName: "Long Biên",
    weight: 280,
    codAmount: 0,
    shippingFee: 18000,
    status: "delivered",
    statusName: "Đã giao",
    employeeName: "Nguyễn Thị Mai",
    branchName: "Chi nhánh HN",
    trackingHistory: [],
    createdTime: "2024-05-06T10:00:00",
    updatedTime: "2024-05-06T16:45:00",
  },
  {
    id: 12,
    trackingCode: "VD1166778899",
    salesOrderId: 1005,
    salesOrderCode: "HD-1005",
    partnerId: 3,
    partnerName: "GHN",
    receiverName: "Dương Minh Tuấn",
    receiverPhone: "091***8899",
    receiverPhoneMasked: "091***8899",
    receiverAddress: "200 Võ Thị Sáu, Quận 3, TP.HCM",
    receiverProvinceName: "TP.HCM",
    receiverDistrictName: "Quận 3",
    weight: 910,
    codAmount: 760000,
    shippingFee: 32000,
    status: "delivered",
    statusName: "Đã giao",
    employeeName: "Lê Văn Hùng",
    branchName: "Chi nhánh HCM",
    trackingHistory: [],
    createdTime: "2024-05-05T11:30:00",
    updatedTime: "2024-05-05T18:00:00",
  },

  // --- returned ---
  {
    id: 6,
    trackingCode: "VD1122334455",
    salesOrderId: 500,
    salesOrderCode: "HD-500",
    partnerId: 1,
    partnerName: "GHTK",
    receiverName: "Lý Văn Quân",
    receiverPhone: "089***5566",
    receiverPhoneMasked: "089***5566",
    receiverAddress: "5 Lê Duẩn, Đống Đa, Hà Nội",
    receiverProvinceName: "Hà Nội",
    receiverDistrictName: "Đống Đa",
    weight: 900,
    codAmount: 420000,
    shippingFee: 30000,
    status: "returned",
    statusName: "Hoàn hàng",
    note: "Khách không nhận hàng",
    employeeName: "Trần Thị Kim",
    branchName: "Chi nhánh HN",
    trackingHistory: [],
    createdTime: "2024-05-05T08:00:00",
    updatedTime: "2024-05-07T11:00:00",
  },
  {
    id: 13,
    trackingCode: "VD1277889900",
    salesOrderId: 501,
    salesOrderCode: "HD-501",
    partnerId: 3,
    partnerName: "GHN",
    receiverName: "Hà Thị Phương",
    receiverPhone: "090***9900",
    receiverPhoneMasked: "090***9900",
    receiverAddress: "60 Nguyễn Đình Chiểu, Quận 1, TP.HCM",
    receiverProvinceName: "TP.HCM",
    receiverDistrictName: "Quận 1",
    weight: 350,
    codAmount: 260000,
    shippingFee: 25000,
    status: "returned",
    statusName: "Hoàn hàng",
    note: "Địa chỉ không chính xác",
    employeeName: "Nguyễn Thị Mai",
    branchName: "Chi nhánh HCM",
    trackingHistory: [],
    createdTime: "2024-05-03T09:00:00",
    updatedTime: "2024-05-05T14:00:00",
  },
  {
    id: 14,
    trackingCode: "VD1388990011",
    salesOrderId: 502,
    salesOrderCode: "HD-502",
    partnerId: 2,
    partnerName: "Viettel Post",
    receiverName: "Tống Văn Bình",
    receiverPhone: "097***0011",
    receiverPhoneMasked: "097***0011",
    receiverAddress: "3 Hàng Bài, Hoàn Kiếm, Hà Nội",
    receiverProvinceName: "Hà Nội",
    receiverDistrictName: "Hoàn Kiếm",
    weight: 1100,
    codAmount: 0,
    shippingFee: 35000,
    status: "returned",
    statusName: "Hoàn hàng",
    note: "Khách hủy đơn trước khi nhận",
    employeeName: "Lê Văn Hùng",
    branchName: "Chi nhánh HN",
    trackingHistory: [],
    createdTime: "2024-05-01T10:00:00",
    updatedTime: "2024-05-04T09:30:00",
  },
];

// =============================================
// 5. BÁO CÁO TỔNG QUAN
// =============================================
export const MOCK_REPORT_SUMMARY: IShippingReportSummaryResponse = {
  totalOrders: 152,
  pendingOrders: 15,
  inTransitOrders: 42,
  deliveredOrders: 86,
  returnedOrders: 9,
  totalCodAmount: 48500000,
  totalShippingFee: 3800000,
  successRate: 90.5,
};

// =============================================
// 6. HÀM HELPER - Lọc & phân trang fake data
// =============================================

/**
 * Lọc đơn vận chuyển theo status, keyword và phân trang.
 * Dùng thay thế ShippingService.filter() khi chưa có API.
 */
export function mockFilterOrders(params: {
  keyword?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { keyword = "", status = "", page = 1, limit = 10 } = params;

  let filtered = [...MOCK_SHIPPING_ORDERS];

  // Lọc theo status tab
  if (status) {
    filtered = filtered.filter((o) => o.status === status);
  }

  // Lọc theo keyword (mã vận đơn, tên KH, SĐT)
  if (keyword.trim()) {
    const kw = keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.trackingCode.toLowerCase().includes(kw) ||
        o.receiverName.toLowerCase().includes(kw) ||
        (o.receiverPhone || "").includes(kw)
    );
  }

  // Đếm theo từng tab
  const tabCounts: Record<string, number> = {
    pending:    MOCK_SHIPPING_ORDERS.filter((o) => o.status === "pending").length,
    in_transit: MOCK_SHIPPING_ORDERS.filter((o) => o.status === "in_transit").length,
    delivered:  MOCK_SHIPPING_ORDERS.filter((o) => o.status === "delivered").length,
    returned:   MOCK_SHIPPING_ORDERS.filter((o) => o.status === "returned").length,
  };

  const total = filtered.length;
  const totalPage = Math.ceil(total / limit);
  const items = filtered.slice((page - 1) * limit, page * limit);

  return {
    code: 0,
    result: {
      items,
      total,
      page,
      totalPage,
      tabCounts,
    },
  };
}

/** Lấy tracking history theo id đơn */
export function mockGetTrackingHistory(shippingOrderId: number) {
  return {
    code: 0,
    result: {
      items: MOCK_TRACKING_HISTORIES[shippingOrderId] || [],
    },
  };
}

/** Lấy danh sách đối tác */
export function mockGetPartners() {
  return {
    code: 0,
    result: { items: MOCK_PARTNERS },
  };
}

/** Lấy cấu hình phí */
export function mockGetFeeConfig() {
  return {
    code: 0,
    result: MOCK_FEE_CONFIG,
  };
}

/** Báo cáo tổng quan */
export function mockGetReportSummary() {
  return {
    code: 0,
    result: MOCK_REPORT_SUMMARY,
  };
}

// =============================================
// 7. DỮ LIỆU BIỂU ĐỒ XU HƯỚNG (30 ngày gần nhất)
// =============================================
export const MOCK_REPORT_CHART_DATA = [
  { date: "01/05", totalOrders: 8,  deliveredOrders: 6,  returnedOrders: 1, codAmount: 3200000, shippingFee: 200000 },
  { date: "02/05", totalOrders: 12, deliveredOrders: 10, returnedOrders: 1, codAmount: 5100000, shippingFee: 300000 },
  { date: "03/05", totalOrders: 7,  deliveredOrders: 5,  returnedOrders: 1, codAmount: 2800000, shippingFee: 175000 },
  { date: "04/05", totalOrders: 15, deliveredOrders: 13, returnedOrders: 0, codAmount: 6500000, shippingFee: 375000 },
  { date: "05/05", totalOrders: 10, deliveredOrders: 8,  returnedOrders: 2, codAmount: 4200000, shippingFee: 250000 },
  { date: "06/05", totalOrders: 5,  deliveredOrders: 4,  returnedOrders: 0, codAmount: 1900000, shippingFee: 125000 },
  { date: "07/05", totalOrders: 4,  deliveredOrders: 3,  returnedOrders: 1, codAmount: 1500000, shippingFee: 100000 },
  { date: "08/05", totalOrders: 18, deliveredOrders: 15, returnedOrders: 1, codAmount: 7800000, shippingFee: 450000 },
  { date: "09/05", totalOrders: 14, deliveredOrders: 12, returnedOrders: 1, codAmount: 5900000, shippingFee: 350000 },
  { date: "10/05", totalOrders: 20, deliveredOrders: 17, returnedOrders: 2, codAmount: 8400000, shippingFee: 500000 },
  { date: "11/05", totalOrders: 16, deliveredOrders: 14, returnedOrders: 1, codAmount: 6800000, shippingFee: 400000 },
  { date: "12/05", totalOrders: 11, deliveredOrders: 9,  returnedOrders: 2, codAmount: 4600000, shippingFee: 275000 },
  { date: "13/05", totalOrders: 9,  deliveredOrders: 8,  returnedOrders: 0, codAmount: 3800000, shippingFee: 225000 },
  { date: "14/05", totalOrders: 6,  deliveredOrders: 5,  returnedOrders: 0, codAmount: 2200000, shippingFee: 150000 },
  { date: "15/05", totalOrders: 22, deliveredOrders: 19, returnedOrders: 1, codAmount: 9200000, shippingFee: 550000 },
  { date: "16/05", totalOrders: 17, deliveredOrders: 15, returnedOrders: 1, codAmount: 7100000, shippingFee: 425000 },
  { date: "17/05", totalOrders: 13, deliveredOrders: 11, returnedOrders: 1, codAmount: 5500000, shippingFee: 325000 },
  { date: "18/05", totalOrders: 19, deliveredOrders: 16, returnedOrders: 2, codAmount: 8000000, shippingFee: 475000 },
  { date: "19/05", totalOrders: 8,  deliveredOrders: 7,  returnedOrders: 0, codAmount: 3400000, shippingFee: 200000 },
  { date: "20/05", totalOrders: 5,  deliveredOrders: 4,  returnedOrders: 1, codAmount: 2000000, shippingFee: 125000 },
  { date: "21/05", totalOrders: 25, deliveredOrders: 21, returnedOrders: 2, codAmount: 10500000, shippingFee: 625000 },
  { date: "22/05", totalOrders: 21, deliveredOrders: 18, returnedOrders: 1, codAmount: 8800000, shippingFee: 525000 },
  { date: "23/05", totalOrders: 16, deliveredOrders: 14, returnedOrders: 1, codAmount: 6700000, shippingFee: 400000 },
  { date: "24/05", totalOrders: 12, deliveredOrders: 10, returnedOrders: 1, codAmount: 5000000, shippingFee: 300000 },
  { date: "25/05", totalOrders: 10, deliveredOrders: 9,  returnedOrders: 0, codAmount: 4200000, shippingFee: 250000 },
  { date: "26/05", totalOrders: 7,  deliveredOrders: 6,  returnedOrders: 0, codAmount: 2900000, shippingFee: 175000 },
  { date: "27/05", totalOrders: 6,  deliveredOrders: 5,  returnedOrders: 1, codAmount: 2400000, shippingFee: 150000 },
  { date: "28/05", totalOrders: 23, deliveredOrders: 20, returnedOrders: 1, codAmount: 9600000, shippingFee: 575000 },
  { date: "29/05", totalOrders: 18, deliveredOrders: 15, returnedOrders: 2, codAmount: 7500000, shippingFee: 450000 },
  { date: "30/05", totalOrders: 14, deliveredOrders: 12, returnedOrders: 1, codAmount: 5800000, shippingFee: 350000 },
];

// =============================================
// 8. BÁO CÁO THEO TỪNG HÃNG VẬN CHUYỂN
// =============================================
export const MOCK_REPORT_BY_PARTNER = [
  { partnerId: 2, partnerName: "Viettel Post",
    totalOrders: 62, deliveredOrders: 55, returnedOrders: 4, inTransitOrders: 3,
    totalCodAmount: 23400000, totalShippingFee: 1550000, successRate: 88.7 },
  { partnerId: 3, partnerName: "GHN",
    totalOrders: 55, deliveredOrders: 51, returnedOrders: 2, inTransitOrders: 2,
    totalCodAmount: 18900000, totalShippingFee: 1540000, successRate: 92.7 },
  { partnerId: 1, partnerName: "GHTK",
    totalOrders: 35, deliveredOrders: 30, returnedOrders: 3, inTransitOrders: 2,
    totalCodAmount: 12200000, totalShippingFee: 875000, successRate: 85.7 },
];

export function mockGetReportChart() {
  return { code: 0, result: { items: MOCK_REPORT_CHART_DATA } };
}

export function mockGetReportByPartner() {
  return { code: 0, result: { items: MOCK_REPORT_BY_PARTNER } };
}