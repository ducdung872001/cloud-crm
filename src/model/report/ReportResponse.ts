// Interfaces cũ — giữ nguyên, các component khác đang dùng
export interface IReportRevenueResponse {
  date: string;
  debt: number;
  expense: number;
  income: number;
  revenue: number;
  time: number;
}

export interface IReportProductResponse {
  id: number;
  name: string;
  amount: number;
}

export interface IReportServiceResponse {
  id: number;
  name: string;
  amount: number;
}

export interface IReportEmployeeResponse {
  id: number;
  name: string;
  amount: number;
}

export interface IReportCityResponse {
  id: number;
  name: string;
  amount: number;
}

export interface IReportCardServiceResponse {
  id: number;
  name: string;
  amount: number;
}

// ─── Interfaces mới cho Báo cáo bán hàng ─────────────────────────────────────

/** API 1 — GET /sales/report/summary */
export interface ISalesReportSummary {
  revenue: number;
  expense: number;
  income: number;
  debt: number;
  latestDate: string; // "DD/MM/YYYY"
}

/** API 2 — GET /sales/report/daily-series — mỗi phần tử là 1 ngày */
export interface ISalesDailySeries {
  time: string;       // "YYYY-MM-DD"
  revenue: number;
  expense: number;
  income: number;
  debt: number;
}

/** API 3 — GET /sales/report/channel-breakdown — mỗi phần tử là 1 kênh */
export type SalesTrend = "UP" | "STABLE" | "DOWN";

export interface ISalesChannelRow {
  saleflowId: number;
  channelName: string;
  channelDesc?: string;   // mô tả kênh (frontend tự thêm nếu API không trả)
  orderCount: number;
  revenue: number;
  avgOrderValue?: number; // = revenue / orderCount nếu API không trả
  ratio: number;          // 0–1, ví dụ 0.491 = 49.1%
  trend: SalesTrend;
  trendPct?: number;      // % thay đổi, ví dụ 12.5
}

/** API 4 — GET /sales/report/sales — gộp cả 3 */
export interface ISalesReportFull {
  summary: ISalesReportSummary;
  dailySeries: ISalesDailySeries[];
  channelRows: ISalesChannelRow[];
}
