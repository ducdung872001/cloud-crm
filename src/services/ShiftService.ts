import { convertParamsToString } from "reborn-util";

// Base URL khớp với prefixSales = "/sales" trong urls.ts
const prefixBiz = "/bizapi";
const prefixSales = prefixBiz + "/sales";

const SHIFT_URLS = {
  overview:        prefixSales + "/shift/overview",
  open:            prefixSales + "/shift/open",
  activeDashboard: prefixSales + "/shift/active-dashboard",
  summary:         prefixSales + "/shift/summary", 
  orders:          prefixSales + "/shift/orders",
  close:           prefixSales + "/shift/close",
  closeReport:     prefixSales + "/shift/close-report",
  sendReport:      prefixSales + "/shift/send-report",
  generalReport:   prefixSales + "/shift/general-report",
  config:          prefixSales + "/shift/config",
  saveConfigs:     prefixSales + "/shift/config/save-configs",
  deleteConfig:    prefixSales + "/shift/config/delete",
  saveStaff:       prefixSales + "/shift/config/save-staff",
  saveRules:       prefixSales + "/shift/config/save-rules",
};

export default {
  /** Tab "Chưa vào ca" — thông tin ca tiếp theo */
  getOverview: (branchId: number) => {
    return fetch(`${SHIFT_URLS.overview}?branchId=${branchId}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  /** Tab "Vào ca" — mở ca mới */
  openShift: (branchId: number, body: {
    shiftConfigId: number;
    posDeviceId?: number;
    openingCash?: number;
    denominations?: { denomination: number; quantity: number }[];
  }) => {
    return fetch(`${SHIFT_URLS.open}?branchId=${branchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  /** Tab "Đang ca" — dashboard realtime */
  getActiveDashboard: (branchId: number) => {
    return fetch(`${SHIFT_URLS.activeDashboard}?branchId=${branchId}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  /** Tab "Đơn trong ca" — summary tổng hợp */
  getShiftSummary: (shiftId: number) => {
    return fetch(`${SHIFT_URLS.summary}?shiftId=${shiftId}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  /** Tab "Đơn trong ca" — danh sách đơn có filter + phân trang */
  getShiftOrders: (params: {
    shiftId: number;
    status?: number;
    paymentType?: number;
    keyword?: string;
    page?: number;
    size?: number;
  }) => {
    return fetch(`${SHIFT_URLS.orders}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  /** Tab "Đóng ca" — đóng ca */
  closeShift: (branchId: number, body: {
    shiftId: number;
    closingCash?: number;
    note?: string;
    denominations?: { denomination: number; quantity: number }[];
  }) => {
    return fetch(`${SHIFT_URLS.close}?branchId=${branchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  /** Tab "Báo cáo kết ca" — lấy dữ liệu báo cáo */
  getCloseReport: (shiftId: number) => {
    return fetch(`${SHIFT_URLS.closeReport}?shiftId=${shiftId}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  /** Tab "Báo cáo kết ca" — nút "Gửi Quản lý" */
  sendShiftReport: (shiftId: number, branchId: number) => {
    return fetch(`${SHIFT_URLS.sendReport}?shiftId=${shiftId}&branchId=${branchId}`, {
      method: "POST",
    }).then((res) => res.json());
  },

  /** Tab "Báo cáo tổng quan" */
  getGeneralReport: (branchId: number) => {
    return fetch(`${SHIFT_URLS.generalReport}?branchId=${branchId}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  /** Thiết lập ca — lấy toàn bộ cấu hình */
  getConfig: (branchId: number) => {
    return fetch(`${SHIFT_URLS.config}?branchId=${branchId}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  /** Thiết lập ca — lưu cấu hình ca */
  saveConfigs: (branchId: number, configs: any[]) => {
    return fetch(`${SHIFT_URLS.saveConfigs}?branchId=${branchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configs),
    }).then((res) => res.json());
  },

  /** Thiết lập ca — xóa 1 ca */
  deleteConfig: (configId: number) => {
    return fetch(`${SHIFT_URLS.deleteConfig}?configId=${configId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  /** Thiết lập ca — lưu phân công nhân viên */
  saveStaff: (assignments: any[]) => {
    return fetch(SHIFT_URLS.saveStaff, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assignments),
    }).then((res) => res.json());
  },

  /** Thiết lập ca — lưu quy tắc & thông báo */
  saveRules: (branchId: number, rules: any) => {
    return fetch(`${SHIFT_URLS.saveRules}?branchId=${branchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rules),
    }).then((res) => res.json());
  },
};
