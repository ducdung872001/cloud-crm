import { urlsApi } from "configs/urls";

// ─── Raw API response types (khớp đúng với backend) ──────────────────────────

interface IRawSummary {
  totalImport:      number;
  totalExport:      number;
  endStock:         number;   // ← backend gọi là endStock
  stockValue:       number;
  lowStockSkuCount: number;   // ← backend gọi là lowStockSkuCount
}

interface IRawMovementItem {
  period:    string;   // "T3"
  periodRaw: string;   // "2026-03"
  importQty: number;
  exportQty: number;
  adjustQty: number;   // ← backend gọi là adjustQty (không phải adjustmentQty)
  // closingQty không có — sẽ bỏ qua hoặc tính từ context
}

interface IRawHealthStats {
  stable:    number;
  watchlist: number;
  critical:  number;
  total:     number;
}

interface IRawEndStockItem {
  period:    string;
  periodRaw: string;
  endStock:  number;   // ← backend gọi là endStock
}

interface IRawWarehousePerf {
  warehouseId:   number;
  warehouseName: string;  // ← backend gọi là warehouseName
  stockQty:      number;  // ← backend gọi là stockQty
  stockValue:    number;
  maxStockValue: number;  // dùng để tính % bar
}

interface IRawProductDetail {
  productId:    number;
  variantId:    number;
  sku:          string;
  productName:  string;
  warehouseId:  number;
  warehouseName: string;
  endStock:     number;   // ← backend gọi là endStock
  availableQty: number;
  stockValue:   number;
  turnoverDays: number;
  status:       "STABLE" | "WATCH" | "CRITICAL"; // enum tiếng Anh
}

interface IRawFullResponse {
  summary:        IRawSummary;
  movementSeries: IRawMovementItem[];
  healthStats:    IRawHealthStats;
  endStockSeries: IRawEndStockItem[];
  warehousePerf:  IRawWarehousePerf[];
  productDetails: IRawProductDetail[];
}

// ─── Display types (dùng trong components) ───────────────────────────────────

export interface IInventorySummary {
  totalImport:    number;
  totalExport:    number;
  closingQty:     number;
  stockValue:     number;
  belowThreshold: number;
}

export interface IInventoryMovement {
  label:         string;
  importQty:     number;
  exportQty:     number;
  adjustmentQty: number;
  closingQty:    number;
}

export interface IInventoryHealth {
  name:   string;
  status: "STABLE" | "WATCH" | "CRITICAL";
  y:      number;
  color:  string;
}

export interface IInventoryTrend {
  label:      string;
  closingQty: number;
}

export interface IInventoryWarehousePerf {
  warehouseId:   number;
  name:          string;
  closingQty:    number;
  stockValue:    number;
  maxStockValue: number;  // dùng cho thanh bar (thay vì tính max từ array)
}

export interface IInventoryProductDetail {
  sku:           string;
  productName:   string;
  warehouseName: string;
  closingQty:    number;
  availableQty:  number;
  stockValue:    number;
  turnoverDays:  number;
  status:        string;  // "Ổn định" | "Cần theo dõi" | "Sắp thiếu"
  color:         string;
}

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
  warehouseId?: number;
  fromTime?:    string;  // "DD/MM/YYYY"
  toTime?:      string;  // "DD/MM/YYYY"
  groupBy?:     "month" | "week" | "day";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatInventoryDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => [k, String(v)]);
  return entries.length ? "?" + new URLSearchParams(entries).toString() : "";
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  STABLE:   { label: "Ổn định",      color: "#10b981" },
  WATCH:    { label: "Cần theo dõi", color: "#f59e0b" },
  CRITICAL: { label: "Sắp thiếu",   color: "#ef4444" },
};

/**
 * Chuyển raw API response → display shape dùng trong components.
 * Xử lý toàn bộ sự khác biệt tên field ở đây, components không cần biết.
 */
function mapRawToDisplay(raw: IRawFullResponse): IInventoryReportFull {
  // 1. Summary — endStock→closingQty, lowStockSkuCount→belowThreshold
  const summary: IInventorySummary = {
    totalImport:    raw.summary.totalImport    ?? 0,
    totalExport:    raw.summary.totalExport    ?? 0,
    closingQty:     raw.summary.endStock       ?? 0,
    stockValue:     raw.summary.stockValue     ?? 0,
    belowThreshold: raw.summary.lowStockSkuCount ?? 0,
  };

  // 2. Movement — movementSeries→movement, period→label, adjustQty→adjustmentQty
  //    closingQty không có trong movementSeries → dùng 0
  const movement: IInventoryMovement[] = (raw.movementSeries ?? []).map((m) => ({
    label:         m.period    ?? "",
    importQty:     m.importQty ?? 0,
    exportQty:     m.exportQty ?? 0,
    adjustmentQty: m.adjustQty ?? 0,
    closingQty:    0,  // backend không trả — biểu đồ cột không cần trường này
  }));

  // 3. Health — healthStats (object) → health[] (array)
  const health: IInventoryHealth[] = [
    { name: "Ổn định",      status: "STABLE",   y: raw.healthStats?.stable    ?? 0, color: "#10b981" },
    { name: "Cần theo dõi", status: "WATCH",    y: raw.healthStats?.watchlist ?? 0, color: "#f59e0b" },
    { name: "Sắp thiếu",   status: "CRITICAL", y: raw.healthStats?.critical  ?? 0, color: "#ef4444" },
  ];

  // 4. Trend — endStockSeries→trend, endStock→closingQty
  const trend: IInventoryTrend[] = (raw.endStockSeries ?? []).map((t) => ({
    label:      t.period   ?? "",
    closingQty: t.endStock ?? 0,
  }));

  // 5. WarehousePerf — warehouseName→name, stockQty→closingQty, giữ maxStockValue
  const warehousePerf: IInventoryWarehousePerf[] = (raw.warehousePerf ?? []).map((w) => ({
    warehouseId:   w.warehouseId,
    name:          w.warehouseName ?? "",
    closingQty:    w.stockQty      ?? 0,
    stockValue:    w.stockValue    ?? 0,
    maxStockValue: w.maxStockValue ?? 0,
  }));

  // 6. ProductDetails — endStock→closingQty, status enum→label+color
  const productDetails: IInventoryProductDetail[] = (raw.productDetails ?? []).map((p) => {
    const statusMeta = STATUS_MAP[p.status] ?? { label: p.status, color: "#6b7280" };
    return {
      sku:           p.sku          ?? "",
      productName:   p.productName  ?? "",
      warehouseName: p.warehouseName ?? "",
      closingQty:    p.endStock     ?? 0,
      availableQty:  p.availableQty ?? 0,
      stockValue:    p.stockValue   ?? 0,
      turnoverDays:  p.turnoverDays ?? 0,
      status:        statusMeta.label,
      color:         statusMeta.color,
    };
  });

  return { summary, movement, health, trend, warehousePerf, productDetails };
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function get<T>(url: string, params: IInventoryReportParams, signal?: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(
      `${url}${buildQuery({ ...params, warehouseId: params.warehouseId ?? 0 })}`,
      { method: "GET", signal }
    );
    if (!res.ok) return null;
    const json = await res.json();
    // Backend wrapper dùng "result" (không phải "data")
    const payload = json.result ?? json.data ?? json;
    return (payload && typeof payload === "object") ? payload as T : null;
  } catch {
    return null;
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

const InventoryReportService = {
  /**
   * Full report — 1 request, áp dụng mapper để chuẩn hóa tên field.
   * GET /inventory/report/stock
   */
  full: async (params: IInventoryReportParams, signal?: AbortSignal): Promise<IInventoryReportFull | null> => {
    const raw = await get<IRawFullResponse>(urlsApi.inventoryReport.full, params, signal);
    if (!raw) return null;
    return mapRawToDisplay(raw);
  },
};

export default InventoryReportService;