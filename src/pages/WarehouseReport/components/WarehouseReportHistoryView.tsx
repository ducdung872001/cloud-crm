import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import { urlsApi } from "configs/urls";
import InventoryService from "services/InventoryService";

// ─── Types ───────────────────────────────────────────────────────────────────

interface IProductOption { value: number; label: string; sku: string; }

interface IHistoryProductInfo {
  productId:    number;
  productName:  string;
  sku:          string;
  categoryName: string;
  barcode:      string;
  currentStock: number;
  avgCost:      number;
  totalImport:  number;
  totalExport:  number;
}

interface IDailyPoint   { label: string; afterStock: number; }
interface IWeeklyPoint  { label: string; importQty: number; exportQty: number; }

interface IHistoryData {
  productInfo: IHistoryProductInfo;
  dailyStock:  IDailyPoint[];
  weeklyFlow:  IWeeklyPoint[];
}

interface ILedgerRow {
  id: number;
  refType?: string; refTypeName?: string; refCode?: string; refId?: number;
  createdTime?: string;
  quantity?: number; quantityChange?: number;
  afterQuantity?: number;
  unitCost?: number;
  warehouseName?: string; fromWarehouseName?: string; toWarehouseName?: string;
}

// ─── Period helpers ───────────────────────────────────────────────────────────

type PeriodKey = "month" | "quarter" | "half" | "year";
const PERIODS: { label: string; key: PeriodKey }[] = [
  { label: "Tháng 3", key: "month" },
  { label: "Quý 1",   key: "quarter" },
  { label: "6 tháng", key: "half" },
  { label: "Cả năm",  key: "year" },
];

function getPeriodRange(key: PeriodKey): [string, string] {
  const fmt = "DD/MM/YYYY";
  if (key === "month")   return [moment().startOf("month").format(fmt), moment().endOf("month").format(fmt)];
  if (key === "quarter") return [moment().startOf("quarter").format(fmt), moment().endOf("quarter").format(fmt)];
  if (key === "half")    return [moment().subtract(6,"months").startOf("month").format(fmt), moment().endOf("month").format(fmt)];
  return [moment().startOf("year").format(fmt), moment().endOf("year").format(fmt)];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtVnd(n: number): string {
  if (n >= 1_000_000) return `${Math.round(n / 1000)}K`;
  return n.toLocaleString("vi-VN") + "đ";
}

const REF_TYPE_COLOR: Record<string, string> = {
  IMPORT: "bb", SALE: "bg", RETURN: "ba", TRANSFER: "bt", ADJUSTMENT: "bo", DESTROY: "br",
};
const REF_TYPE_NAME: Record<string, string> = {
  IMPORT: "Nhập hàng", SALE: "Xuất bán", RETURN: "Khách trả",
  TRANSFER: "Điều chuyển", ADJUSTMENT: "Điều chỉnh", DESTROY: "Xuất hủy",
};

function Skeleton({ h = 20, w = "100%" }: { h?: number; w?: string }) {
  return <div style={{
    height: h, width: w, borderRadius: 5,
    background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
    backgroundSize: "200% 100%", animation: "hist-shimmer 1.4s infinite",
  }} />;
}

function buildQuery(p: Record<string, any>) {
  const e = Object.entries(p).filter(([,v]) => v !== undefined && v !== "" && v !== 0).map(([k,v]) => [k, String(v)]);
  return e.length ? "?" + new URLSearchParams(e).toString() : "";
}

// ─── Chart builders ───────────────────────────────────────────────────────────

function buildStockLineOptions(daily: IDailyPoint[], productName: string): Highcharts.Options {
  return {
    chart: { type: "areaspline", height: 240, backgroundColor: "transparent" },
    xAxis: { categories: daily.map(d => d.label), lineColor: "#e4e2d9",
             tickInterval: Math.max(1, Math.floor(daily.length / 10)) },
    yAxis: { title: { text: undefined }, gridLineColor: "rgba(0,0,0,0.055)", min: 0 },
    legend: { enabled: false },
    tooltip: { pointFormat: "<b>Tồn: {point.y}</b>" },
    plotOptions: { areaspline: { marker: { enabled: false }, lineWidth: 2, fillOpacity: 0.1 } },
    series: [{ type: "areaspline", name: "Tồn kho", data: daily.map(d => d.afterStock), color: "#1d4ed8" }],
  };
}

function buildWeeklyFlowOptions(weekly: IWeeklyPoint[]): Highcharts.Options {
  return {
    chart: { type: "column", height: 240, backgroundColor: "transparent" },
    xAxis: { categories: weekly.map(w => w.label), lineColor: "#e4e2d9" },
    yAxis: { title: { text: undefined }, gridLineColor: "rgba(0,0,0,0.055)" },
    legend: { enabled: false },
    tooltip: { shared: true },
    plotOptions: { column: { borderRadius: 3 } },
    series: [
      { type: "column", name: "Nhập kho", data: weekly.map(w => w.importQty), color: "#1d4ed8" },
      { type: "column", name: "Xuất kho", data: weekly.map(w => w.exportQty), color: "#f97316" },
    ],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WarehouseReportHistoryView() {
  const abortRef    = useRef<AbortController | null>(null);
  const ledgerAbort = useRef<AbortController | null>(null);

  const [period, setPeriod]           = useState<PeriodKey>("month");
  const [warehouseId, setWarehouseId] = useState(0);
  const [warehouseList, setWarehouseList] = useState<{ value: number; label: string }[]>([]);

  // Product search
  const [searchKw, setSearchKw]       = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [productOptions, setProductOptions] = useState<IProductOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<IProductOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Data
  const [histData, setHistData]       = useState<IHistoryData | null>(null);
  const [ledgerRows, setLedgerRows]   = useState<ILedgerRow[]>([]);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [isLoading, setIsLoading]     = useState(false);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [hasFetched, setHasFetched]   = useState(false);

  // Load warehouses
  useEffect(() => {
    InventoryService.list({ page: 1, limit: 200 }).then(r => {
      const arr = Array.isArray(r.result) ? r.result
        : Array.isArray(r.result?.items) ? r.result.items : [];
      setWarehouseList(arr.map((i: any) => ({ value: i.id, label: i.name })));
    }).catch(() => {});
  }, []);

  // Product search debounce
  useEffect(() => {
    if (!searchKw.trim()) { setProductOptions([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${urlsApi.product.list}${buildQuery({ keyword: searchKw, page: 1, limit: 10 })}`);
        const json = await res.json();
        const items = Array.isArray(json.result) ? json.result
          : Array.isArray(json.result?.items) ? json.result.items : [];
        setProductOptions(items.map((p: any) => ({ value: p.id, label: p.name, sku: p.code ?? "" })));
        setShowDropdown(true);
      } catch {}
    }, 350);
    return () => clearTimeout(t);
  }, [searchKw]);

  const fetchHistory = useCallback(async (prod: IProductOption) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsLoading(true);
    const [from, to] = getPeriodRange(period);
    try {
      const q = buildQuery({ productId: prod.value, warehouseId, fromTime: from, toTime: to });
      const res = await fetch(`${urlsApi.inventoryReport.history}${q}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (!ctrl.signal.aborted) { setHistData(json.result ?? json.data ?? null); setHasFetched(true); }
    } catch { if (!ctrl.signal.aborted) setHistData(null); }
    setIsLoading(false);
  }, [period, warehouseId]);

  const fetchLedger = useCallback(async (prod: IProductOption) => {
    if (ledgerAbort.current) ledgerAbort.current.abort();
    const ctrl = new AbortController();
    ledgerAbort.current = ctrl;
    setIsLoadingLedger(true);
    const [from, to] = getPeriodRange(period);
    try {
      const q = buildQuery({ productId: prod.value, warehouseId, fromTime: from, toTime: to, page: 0, size: 50 });
      const res = await fetch(`${urlsApi.inventory.ledgerList}${q}`, { signal: ctrl.signal });
      const json = await res.json();
      if (!ctrl.signal.aborted) {
        const result = json.result ?? json.data ?? {};
        setLedgerRows(result.items ?? result.content ?? []);
        setLedgerTotal(+(result.total ?? result.totalElements ?? 0));
      }
    } catch {}
    setIsLoadingLedger(false);
  }, [period, warehouseId]);

  useEffect(() => {
    if (selectedProduct) { fetchHistory(selectedProduct); fetchLedger(selectedProduct); }
    return () => { abortRef.current?.abort(); ledgerAbort.current?.abort(); };
  }, [selectedProduct, period, warehouseId]);

  const info     = histData?.productInfo;
  const daily    = histData?.dailyStock  ?? [];
  const weekly   = histData?.weeklyFlow  ?? [];
  const [from, to] = getPeriodRange(period);
  const periodLabel = PERIODS.find(p => p.key === period)?.label ?? "";

  const stockLineOpts = useMemo(() => buildStockLineOptions(daily, info?.productName ?? ""), [daily]);
  const weeklyOpts    = useMemo(() => buildWeeklyFlowOptions(weekly), [weekly]);

  return (
    <div className="warehouse-report-view">

      {/* ── Filter bar ── */}
      <div className="filter-bar" style={{ flexWrap: "wrap", gap: "0.8rem" }}>
        {/* Product search */}
        <div style={{ position: "relative", minWidth: 260 }}>
          <span className="filter-label" style={{ marginRight: 6 }}>Sản phẩm:</span>
          {selectedProduct ? (
            <button
              className="f-btn on"
              style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              onClick={() => { setSelectedProduct(null); setSearchInput(""); setSearchKw(""); }}
            >
              {selectedProduct.label} ({selectedProduct.sku}) ✕
            </button>
          ) : (
            <input
              className="f-btn"
              style={{ minWidth: 200, cursor: "text", background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: "0.5rem 1rem" }}
              placeholder="Tìm tên hoặc mã SP..."
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setSearchKw(e.target.value); }}
              onFocus={() => searchKw && setShowDropdown(true)}
            />
          )}
          {showDropdown && productOptions.length > 0 && !selectedProduct && (
            <div style={{
              position: "absolute", top: "100%", left: 0, zIndex: 99,
              background: "#fff", border: "1px solid #ddd", borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)", minWidth: 280, maxHeight: 240, overflowY: "auto",
            }}>
              {productOptions.map(opt => (
                <div
                  key={opt.value}
                  style={{ padding: "0.8rem 1.2rem", cursor: "pointer", borderBottom: "1px solid #f0f0f0" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f7f8fc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                  onClick={() => {
                    setSelectedProduct(opt);
                    setSearchInput(opt.label);
                    setShowDropdown(false);
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{opt.label}</div>
                  <div style={{ fontSize: "1.2rem", color: "#888" }}>{opt.sku}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Period */}
        <span className="filter-label">Kỳ:</span>
        <div className="filter-group">
          {PERIODS.map(p => (
            <button key={p.key} className={`f-btn${period === p.key ? " on" : ""}`}
              type="button" onClick={() => setPeriod(p.key)}>{p.label}</button>
          ))}
        </div>
        <div className="filter-sep" />

        {/* Warehouse */}
        <select className="f-select" value={warehouseId} onChange={e => setWarehouseId(Number(e.target.value))}>
          <option value={0}>Tất cả kho</option>
          {warehouseList.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
        </select>
        <div className="filter-spacer" />
        <button className="btn btn-primary" type="button"
          onClick={() => selectedProduct && fetchHistory(selectedProduct)}
          disabled={isLoading || !selectedProduct}>
          {isLoading ? "Đang tải..." : "Xem lịch sử"}
        </button>
      </div>

      {/* ── Product info card ── */}
      {!selectedProduct ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#999", background: "#f9f9f9", borderRadius: 10, margin: "1.6rem 0" }}>
          🔍 Vui lòng tìm và chọn sản phẩm để xem lịch sử tồn kho
        </div>
      ) : (
        <div className="product-info-card">
          <div className="product-info-card__icon">📦</div>
          <div className="product-info-card__body">
            <div className="product-info-card__title">
              {info?.productName ?? selectedProduct.label}
            </div>
            <div className="product-info-card__desc">
              {info?.sku ?? selectedProduct.sku}
              {info?.categoryName ? ` · ${info.categoryName}` : ""}
              {info?.barcode ? ` · Barcode: ${info.barcode}` : ""}
            </div>
          </div>
        </div>
      )}

      {/* ── KPI row ── */}
      {selectedProduct && (
        <div className="kpi-row">
          {isLoading || !info ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="kpi">
                <Skeleton h={13} w="60%" /><div style={{ height: 6 }} />
                <Skeleton h={28} w="70%" /><div style={{ height: 6 }} />
                <Skeleton h={12} w="65%" />
              </div>
            ))
          ) : (
            <>
              <div className="kpi">
                <div className="kpi-l">Tồn hiện tại</div>
                <div className="kpi-v b">{info.currentStock.toLocaleString("vi-VN")}</div>
                <div className="kpi-d neu">{info.productName}</div>
              </div>
              <div className="kpi">
                <div className="kpi-l">Đã nhập ({periodLabel})</div>
                <div className="kpi-v g">+{info.totalImport.toLocaleString("vi-VN")}</div>
                <div className="kpi-d neu">Kho hiện tại</div>
              </div>
              <div className="kpi">
                <div className="kpi-l">Đã xuất ({periodLabel})</div>
                <div className="kpi-v r">-{info.totalExport.toLocaleString("vi-VN")}</div>
                <div className="kpi-d neu">Xuất bán tháng 3</div>
              </div>
              <div className="kpi">
                <div className="kpi-l">Giá vốn TB</div>
                <div className="kpi-v">{fmtVnd(info.avgCost)}</div>
                <div className="kpi-d neu">Giá bình quân hiện tại</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Charts ── */}
      {selectedProduct && (
        <div className="chart-row">
          <div className="chart-card">
            <div className="cc-title">Biến động tồn kho theo ngày</div>
            <div className="cc-sub">{periodLabel} · {info?.productName ?? ""} ({info?.sku ?? ""})</div>
            {isLoading ? <Skeleton h={240} /> : (
              daily.length > 0
                ? <HighchartsReact highcharts={Highcharts} options={stockLineOpts} />
                : <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>Không có giao dịch trong kỳ</div>
            )}
          </div>
          <div className="chart-card">
            <div className="cc-title">Nhập / Xuất theo tuần</div>
            <div className="cc-sub">4 tuần gần nhất</div>
            <div className="legend">
              <div className="li"><span className="ld" style={{ background: "#1d4ed8" }} />Nhập kho</div>
              <div className="li"><span className="ld" style={{ background: "#f97316" }} />Xuất kho</div>
            </div>
            {isLoading ? <Skeleton h={240} /> : (
              weekly.length > 0
                ? <HighchartsReact highcharts={Highcharts} options={weeklyOpts} />
                : <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>Không có dữ liệu</div>
            )}
          </div>
        </div>
      )}

      {/* ── Transaction table ── */}
      {selectedProduct && (
        <div className="tbl-card">
          <div className="tbl-head">
            <h3>Lịch sử biến động — {info?.productName ?? selectedProduct.label} ({info?.sku ?? selectedProduct.sku})</h3>
            <span className="tbl-meta">
              {periodLabel} · {isLoadingLedger ? "Đang tải..." : `${ledgerTotal} giao dịch`}
            </span>
          </div>
          <div className="tbl-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Loại giao dịch</th>
                  <th>Chứng từ</th>
                  <th className="r">Nhập</th>
                  <th className="r">Xuất</th>
                  <th className="r">Tồn sau GD</th>
                  <th className="r">Giá vốn đơn</th>
                  <th>Kho</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingLedger ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j}><Skeleton h={16} /></td>)}</tr>
                  ))
                ) : ledgerRows.length > 0 ? (
                  ledgerRows.map(row => {
                    const qty      = row.quantityChange ?? row.quantity ?? 0;
                    const isImport = qty > 0;
                    const refType  = row.refType ?? "";
                    const badgeCls = REF_TYPE_COLOR[refType] ?? "ba";
                    const typeName = row.refTypeName ?? REF_TYPE_NAME[refType] ?? refType;
                    const code     = row.refCode ?? (row.refId ? `#${row.refId}` : "—");
                    const wh       = refType === "TRANSFER"
                      ? `${row.fromWarehouseName ?? "?"} → ${row.toWarehouseName ?? "?"}`
                      : row.warehouseName ?? "—";
                    return (
                      <tr key={row.id}>
                        <td>{row.createdTime ? moment(row.createdTime).format("DD/MM/YYYY") : "—"}</td>
                        <td><span className={`badge ${badgeCls}`}>{typeName}</span></td>
                        <td className="vb">{code}</td>
                        <td className="r vg">{isImport ? `+${qty.toLocaleString("vi-VN")}` : "—"}</td>
                        <td className="r vr">{!isImport ? `-${Math.abs(qty).toLocaleString("vi-VN")}` : "—"}</td>
                        <td className="r">{row.afterQuantity != null ? row.afterQuantity.toLocaleString("vi-VN") : "—"}</td>
                        <td className="r">{row.unitCost ? fmtVnd(row.unitCost) : "—"}</td>
                        <td>{wh}</td>
                      </tr>
                    );
                  })
                ) : hasFetched ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
                    Không có giao dịch trong kỳ này
                  </td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @keyframes hist-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .vb { color: var(--primary-color); font-weight: 500; }
      `}</style>
    </div>
  );
}