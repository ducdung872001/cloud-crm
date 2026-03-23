import { urlsApi } from "configs/urls";

// ─── Request ──────────────────────────────────────────────────────────────────

export interface IXntReportParams {
  warehouseId?: number;   // 0 = tất cả kho
  fromTime?:    string;   // "DD/MM/YYYY"
  toTime?:      string;   // "DD/MM/YYYY"
  groupBy?:     "month" | "week" | "day";
}

// ─── Response shapes (khớp đúng với backend InventoryReportResponse) ─────────

export interface IXntSummary {
  openingQty:   number;   // tồn đầu kỳ
  totalImport:  number;   // tổng nhập kỳ
  totalExport:  number;   // tổng xuất kỳ  (giá trị dương)
  closingQty:   number;   // tồn cuối kỳ   (endStock từ backend)
  importGrowth: number;   // % tăng so kỳ trước (có thể null → 0)
}

export interface IXntDailyPoint {
  label:     string;   // "1/3", "2/3", ...
  importQty: number;
  exportQty: number;
}

export interface IXntWarehouseRatio {
  warehouseId:   number;
  warehouseName: string;
  stockQty:      number;
  stockValue:    number;
  ratio:         number;  // % tỷ trọng (backend tính sẵn)
}

export interface IXntProductRow {
  productId:    number;
  variantId:    number;
  sku:          string;
  productName:  string;
  warehouseName:string;
  openingQty:   number;
  importQty:    number;
  exportQty:    number;   // giá trị dương
  closingQty:   number;
}

export interface IXntReportData {
  summary:        IXntSummary;
  dailySeries:    IXntDailyPoint[];
  warehouseRatio: IXntWarehouseRatio[];
  productRows:    IXntProductRow[];
}

// ─── Raw response từ /report/stock (reuse InventoryReportResponse) ────────────

interface IRawSummary {
  totalImport:      number;
  totalExport:      number;
  endStock:         number;
  stockValue:       number;
  lowStockSkuCount: number;
  openingStock?:    number;
  importGrowthPct?: number;
}

interface IRawMovementItem {
  period:    string;
  periodRaw: string;
  importQty: number;
  exportQty: number;
  adjustQty: number;
}

interface IRawWarehousePerf {
  warehouseId:   number;
  warehouseName: string;
  stockQty:      number;
  stockValue:    number;
  maxStockValue: number;
  ratioPct?:     number;
}

interface IRawProductDetail {
  productId:    number;
  variantId:    number;
  sku:          string;
  productName:  string;
  warehouseName:string;
  endStock:     number;
  availableQty: number;
  stockValue:   number;
  openingStock?: number;
  importQty?:   number;
  exportQty?:   number;
}

interface IRawFullResponse {
  summary:        IRawSummary;
  movementSeries: IRawMovementItem[];
  healthStats:    any;
  endStockSeries: any[];
  warehousePerf:  IRawWarehousePerf[];
  productDetails: IRawProductDetail[];
}

// ─── Mapper raw → display ─────────────────────────────────────────────────────

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "" && v !== 0)
    .map(([k, v]) => [k, String(v)]);
  return entries.length ? "?" + new URLSearchParams(entries).toString() : "";
}

function mapRaw(raw: IRawFullResponse, params: IXntReportParams): IXntReportData {
  const s = raw.summary ?? {};

  // ── Summary ──
  const totalExportAbs = Math.abs(s.totalExport ?? 0);
  const summary: IXntSummary = {
    openingQty:   s.openingStock  ?? 0,
    totalImport:  s.totalImport   ?? 0,
    totalExport:  totalExportAbs,
    closingQty:   s.endStock      ?? 0,
    importGrowth: s.importGrowthPct ?? 0,
  };

  // ── Daily series — movementSeries ──
  const dailySeries: IXntDailyPoint[] = (raw.movementSeries ?? []).map(m => ({
    label:     m.period ?? "",
    importQty: m.importQty ?? 0,
    exportQty: Math.abs(m.exportQty ?? 0),
  }));

  // ── Warehouse ratio — warehousePerf ──
  const total = (raw.warehousePerf ?? []).reduce((s, w) => s + (w.stockQty ?? 0), 0) || 1;
  const warehouseRatio: IXntWarehouseRatio[] = (raw.warehousePerf ?? []).map(w => ({
    warehouseId:   w.warehouseId,
    warehouseName: w.warehouseName ?? "",
    stockQty:      w.stockQty      ?? 0,
    stockValue:    w.stockValue    ?? 0,
    ratio:         w.ratioPct ?? Math.round((w.stockQty ?? 0) / total * 100),
  }));

  // ── Product rows — productDetails ──
  const productRows: IXntProductRow[] = (raw.productDetails ?? []).map(p => ({
    productId:    p.productId,
    variantId:    p.variantId,
    sku:          p.sku           ?? "",
    productName:  p.productName   ?? "",
    warehouseName:p.warehouseName ?? "",
    openingQty:   p.openingStock  ?? 0,
    importQty:    p.importQty     ?? 0,
    exportQty:    Math.abs(p.exportQty ?? 0),
    closingQty:   p.endStock      ?? 0,
  }));

  return { summary, dailySeries, warehouseRatio, productRows };
}

// ─── Service ──────────────────────────────────────────────────────────────────

const WarehouseReportService = {
  /**
   * Lấy toàn bộ dữ liệu Báo cáo XNT (1 call).
   * GET /inventory/report/stock
   */
  getXntReport: async (
    params: IXntReportParams,
    signal?: AbortSignal
  ): Promise<IXntReportData | null> => {
    try {
      const query = buildQuery({
        warehouseId: params.warehouseId ?? 0,
        fromTime:    params.fromTime,
        toTime:      params.toTime,
        groupBy:     params.groupBy ?? "day",
      });
      const res = await fetch(`${urlsApi.inventoryReport.full}${query}`, {
        method: "GET",
        signal,
      });
      if (!res.ok) return null;
      const json = await res.json();
      const raw: IRawFullResponse = json.result ?? json.data ?? json;
      if (!raw || typeof raw !== "object") return null;
      return mapRaw(raw, params);
    } catch {
      return null;
    }
  },

  /** Danh sách kho cho filter dropdown */
  getWarehouses: async (): Promise<{ value: number; label: string }[]> => {
    try {
      const res  = await fetch(`${urlsApi.inventory.list}?page=1&limit=200`, { method: "GET" });
      if (!res.ok) return [];
      const json = await res.json();
      const data = Array.isArray(json.result) ? json.result
        : Array.isArray(json.result?.items) ? json.result.items : [];
      return data.map((i: any) => ({ value: i.id as number, label: i.name as string }));
    } catch {
      return [];
    }
  },
};

export default WarehouseReportService;
