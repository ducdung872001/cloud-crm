import { urlsApi } from "configs/urls";

// ─── Response types — khớp với backend ──────────────────────────────────────

export interface IInventorySummary {
  totalImport:    number;   // Tổng nhập trong kỳ
  totalExport:    number;   // Tổng xuất trong kỳ
  closingQty:     number;   // Tồn cuối kỳ
  stockValue:     number;   // Giá trị tồn kho (VND)
  belowThreshold: number;   // Số SKU cần bổ sung
}

export interface IInventoryMovement {
  label:          string;   // "T10", "T11", ... hoặc "DD/MM"
  importQty:      number;
  exportQty:      number;
  adjustmentQty:  number;
  closingQty:     number;
}

export type StockHealthStatus = "STABLE" | "WATCH" | "LOW";

export interface IInventoryHealth {
  name:   string;           // "Ổn định" | "Cần theo dõi" | "Sắp thiếu"
  status: StockHealthStatus;
  y:      number;           // số SKU
  color:  string;           // hex màu badge
}

export interface IInventoryTrend {
  label:      string;       // "T10", "T11"...
  closingQty: number;
}

export interface IInventoryWarehousePerf {
  warehouseId:   number;
  name:          string;
  closingQty:    number;
  stockValue:    number;
}

export interface IInventoryProductDetail {
  sku:           string;
  productName:   string;
  warehouseName: string;
  closingQty:    number;
  availableQty:  number;
  stockValue:    number;
  turnoverDays:  number;
  status:        string;    // "Ổn định" | "Cần theo dõi" | "Sắp thiếu"
  color:         string;    // hex màu badge
}

/** Full report (API 1 — gộp tất cả, khuyến nghị dùng) */
export interface IInventoryReportFull {
  summary:        IInventorySummary;
  movement:       IInventoryMovement[];
  health:         IInventoryHealth[];
  trend:          IInventoryTrend[];
  warehousePerf:  IInventoryWarehousePerf[];
  productDetails: IInventoryProductDetail[];
}

// ─── Params ───────────────────────────────────────────────────────────────────

export interface IInventoryReportParams {
  warehouseId?: number;    // 0 = tất cả
  fromTime?:    string;    // "DD/MM/YYYY"
  toTime?:      string;    // "DD/MM/YYYY"
  groupBy?:     "month" | "week" | "day";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => [k, String(v)]);
  return entries.length ? "?" + new URLSearchParams(entries).toString() : "";
}

/** Format Date → "DD/MM/YYYY" */
export function formatInventoryDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

async function get<T>(url: string, params: IInventoryReportParams, signal?: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(`${url}${buildQuery({ ...params, warehouseId: params.warehouseId ?? 0 })}`, {
      method: "GET",
      signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
    const payload = json.data ?? json.result ?? json;
    return (payload && typeof payload === "object") ? payload as T : null;
  } catch {
    return null;
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

const InventoryReportService = {
  /**
   * Full report — 1 request, trả về tất cả (khuyến nghị).
   * GET /inventory/report/stock?warehouseId=&fromTime=&toTime=&groupBy=
   */
  full: (params: IInventoryReportParams, signal?: AbortSignal) =>
    get<IInventoryReportFull>(urlsApi.inventoryReport.full, params, signal),

  /** Chỉ 5 KPI card */
  summary: (params: IInventoryReportParams, signal?: AbortSignal) =>
    get<IInventorySummary>(urlsApi.inventoryReport.summary, params, signal),

  /** Biến động nhập/xuất/điều chỉnh theo kỳ */
  movement: (params: IInventoryReportParams, signal?: AbortSignal) =>
    get<IInventoryMovement[]>(urlsApi.inventoryReport.movement, params, signal),

  /** Sức khỏe tồn kho — không cần fromTime/toTime */
  health: (params: Pick<IInventoryReportParams, "warehouseId">, signal?: AbortSignal) =>
    get<IInventoryHealth[]>(urlsApi.inventoryReport.health, params, signal),

  /** Xu hướng tồn cuối kỳ */
  trend: (params: IInventoryReportParams, signal?: AbortSignal) =>
    get<IInventoryTrend[]>(urlsApi.inventoryReport.trend, params, signal),

  /** Hiệu suất từng kho — không cần fromTime/toTime */
  warehousePerf: (params: Pick<IInventoryReportParams, "warehouseId">, signal?: AbortSignal) =>
    get<IInventoryWarehousePerf[]>(urlsApi.inventoryReport.warehousePerf, params, signal),

  /** Chi tiết sản phẩm (bảng) */
  productDetails: (params: IInventoryReportParams, signal?: AbortSignal) =>
    get<IInventoryProductDetail[]>(urlsApi.inventoryReport.productDetails, params, signal),
};

export default InventoryReportService;
