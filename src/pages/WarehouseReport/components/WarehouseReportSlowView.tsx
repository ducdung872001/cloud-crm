import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { urlsApi } from "configs/urls";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ISlowSummary {
  slowSkuCount:   number;
  lockedValue:    number;   // VNĐ
  lockedValuePct: number;   // %
  avgStockDays:   number;
  promoCount:     number;
}

interface ISlowBucket {
  label: string;
  count: number;
  color: string;
}

interface ISlowGroup {
  categoryName: string;
  lockedValue:  number; // Triệu đồng
}

interface ISlowProductRow {
  productId:      number;
  variantId:      number;
  sku:            string;
  productName:    string;
  categoryName:   string;
  warehouseName:  string;
  endStock:       number;
  stockDays:      number;
  lockedValue:    number; // VNĐ
  lastExportDate: string | null;
  suggestion:     "URGENT" | "PROMO" | "TRANSFER" | "WATCH";
}

interface ISlowData {
  summary:     ISlowSummary;
  daysBuckets: ISlowBucket[];
  groupValues: ISlowGroup[];
  productRows: ISlowProductRow[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const THRESHOLD_OPTIONS = [
  { label: "90 ngày", value: 90 },
  { label: "60 ngày", value: 60 },
  { label: "30 ngày", value: 30 },
  { label: "180 ngày", value: 180 },
];

const SUGGESTION_MAP: Record<string, { label: string; cls: string }> = {
  URGENT:   { label: "Cần xử lý gấp", cls: "br" },
  PROMO:    { label: "Khuyến mãi",     cls: "bo" },
  TRANSFER: { label: "Điều chuyển",    cls: "bb" },
  WATCH:    { label: "Theo dõi",       cls: "ba" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtVnd(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  return `${n.toLocaleString("vi-VN")}đ`;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const e = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== 0 && v !== "")
    .map(([k, v]) => [k, String(v)]);
  return e.length ? "?" + new URLSearchParams(e).toString() : "";
}

function Skeleton({ h = 20, w = "100%" }: { h?: number; w?: string }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: 5,
      background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
      backgroundSize: "200% 100%", animation: "slow-shimmer 1.4s infinite",
    }} />
  );
}

// ─── Chart builders ───────────────────────────────────────────────────────────

function buildDonutOptions(buckets: ISlowBucket[], threshold: number): Highcharts.Options {
  return {
    chart: { type: "pie", height: 280, backgroundColor: "transparent" },
    tooltip: { pointFormat: "<b>{point.y} sản phẩm</b>" },
    plotOptions: {
      pie: {
        innerSize: "58%", borderWidth: 0,
        dataLabels: { enabled: false },
        point: { events: {} },
      },
    },
    legend: { enabled: false },
    series: [{
      type: "pie",
      data: buckets.map(b => ({ name: b.label, y: b.count, color: b.color })),
    }],
  };
}

function buildBarOptions(groups: ISlowGroup[]): Highcharts.Options {
  const COLORS = ["#ef4444","#f97316","#f59e0b","#84cc16","#06b6d4","#8b5cf6"];
  return {
    chart: { type: "bar", height: Math.max(200, groups.length * 44 + 60), backgroundColor: "transparent" },
    xAxis: { categories: groups.map(g => g.categoryName), lineColor: "#e4e2d9" },
    yAxis: { title: { text: undefined }, gridLineColor: "rgba(0,0,0,0.055)" },
    legend: { enabled: false },
    tooltip: { pointFormat: "<b>{point.y:.1f}M đồng</b>" },
    plotOptions: { bar: { borderRadius: 4, colorByPoint: true } },
    colors: COLORS,
    series: [{ type: "bar", name: "Giá trị ứ đọng (triệu đồng)", data: groups.map(g => g.lockedValue) }],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WarehouseReportSlowView() {
  const abortRef = useRef<AbortController | null>(null);

  const [threshold, setThreshold]       = useState(90);
  const [warehouseId, setWarehouseId]   = useState(0);
  const [categoryId, setCategoryId]     = useState(0);
  const [warehouseList, setWarehouseList] = useState<{ value: number; label: string }[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [hasFetched, setHasFetched]     = useState(false);
  const [isExporting, setIsExporting]   = useState(false);
  const [data, setData]                 = useState<ISlowData | null>(null);

  // Load warehouse list
  useEffect(() => {
    fetch(`${urlsApi.inventory.list}?page=1&limit=200`)
      .then(r => r.json())
      .then(json => {
        const arr = Array.isArray(json.result) ? json.result
          : Array.isArray(json.result?.items) ? json.result.items : [];
        setWarehouseList(arr.map((i: any) => ({ value: i.id, label: i.name })));
      })
      .catch(() => {});
  }, []);

  const fetchReport = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsLoading(true);
    try {
      const q = buildQuery({ warehouseId, categoryId, thresholdDays: threshold });
      const res = await fetch(`${urlsApi.inventoryReport.slow}${q}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const raw = json.result ?? json.data ?? json;
      if (!ctrl.signal.aborted && raw && typeof raw === "object") {
        setData(raw as ISlowData);
        setHasFetched(true);
      }
    } catch {
      if (!ctrl.signal.aborted) setData(null);
    }
    setIsLoading(false);
  }, [threshold, warehouseId, categoryId]);

  useEffect(() => {
    fetchReport();
    return () => abortRef.current?.abort();
  }, [fetchReport]);

  const summary     = data?.summary;
  const buckets     = data?.daysBuckets  ?? [];
  const groups      = data?.groupValues  ?? [];
  const rows        = data?.productRows  ?? [];

  const donutOptions = useMemo(() => buildDonutOptions(buckets, threshold), [buckets, threshold]);
  const barOptions   = useMemo(() => buildBarOptions(groups), [groups]);

  // ── Export Excel ─────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    if (isExporting || rows.length === 0) return;
    setIsExporting(true);
    try {
      const LABEL: Record<string, string> = {
        URGENT: "Xử lý khẩn", PROMO: "Khuyến mãi", TRANSFER: "Điều chuyển", WATCH: "Theo dõi",
      };
      const headers = ["STT","Tên sản phẩm","SKU","Danh mục","Kho","Tồn kho","Số ngày tồn","Giá trị ứ đọng (VNĐ)","Lần xuất cuối","Đề xuất xử lý"];
      // Cột số: index 5=tồn kho, 6=số ngày tồn, 7=giá trị ứ đọng
      const NUM_COLS = new Set([5, 6, 7]);
      const COL_WIDTHS = [42, 224, 154, 126, 168, 70, 84, 154, 112, 112]; // points * 7
      const esc = (s: string) => s
        .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
      const colDefs = COL_WIDTHS.map(w => `<Column ss:AutoFitWidth="0" ss:Width="${w}"/>`).join("");
      const dataRows = rows.map((r, i) => {
        const cols = [
          String(i+1), r.productName, r.sku ?? "—", r.categoryName ?? "—",
          r.warehouseName ?? "—", String(r.endStock), String(r.stockDays),
          String(r.lockedValue), r.lastExportDate ?? "—", LABEL[r.suggestion] ?? r.suggestion,
        ];
        const cells = cols.map((v, ci) =>
          NUM_COLS.has(ci)
            ? `<Cell ss:StyleID="numR"><Data ss:Type="Number">${esc(v)}</Data></Cell>`
            : `<Cell><Data ss:Type="String">${esc(v)}</Data></Cell>`
        ).join("");
        return `<Row>${cells}</Row>`;
      });
      const title = `BÁO CÁO HÀNG CHẬM LUÂN CHUYỂN — Ngưỡng ${threshold} ngày`;
      const total = rows.reduce((s, r) => s + r.lockedValue, 0).toLocaleString("vi-VN");
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
  <Style ss:ID="title"><Font ss:Bold="1" ss:Size="13" ss:Color="#015aa4"/></Style>
  <Style ss:ID="hdr"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#015aa4" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>
  <Style ss:ID="numR"><Alignment ss:Horizontal="Right"/><NumberFormat ss:Format="#,##0.##"/></Style>
  <Style ss:ID="sum"><Font ss:Bold="1" ss:Color="#015aa4"/><Interior ss:Color="#E0EBF8" ss:Pattern="Solid"/></Style>
</Styles>
<Worksheet ss:Name="Hàng chậm luân chuyển"><Table>
${colDefs}
<Row ss:Height="28"><Cell ss:MergeAcross="${headers.length-1}" ss:StyleID="title"><Data ss:Type="String">${esc(title)}</Data></Cell></Row>
<Row ss:Height="16"><Cell ss:MergeAcross="${headers.length-1}"><Data ss:Type="String">Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}</Data></Cell></Row>
<Row ss:Height="22">${headers.map(h => `<Cell ss:StyleID="hdr"><Data ss:Type="String">${esc(h)}</Data></Cell>`).join("")}</Row>
${dataRows.join("\n")}
<Row ss:Height="20"><Cell ss:MergeAcross="${headers.length-1}" ss:StyleID="sum"><Data ss:Type="String">Tổng: ${rows.length} sản phẩm — Tổng giá trị ứ đọng: ${total} VNĐ</Data></Cell></Row>
</Table></Worksheet></Workbook>`;
      const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hang_cham_luan_chuyen_${threshold}ngay_${new Date().toISOString().slice(0,10)}.xls`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const alertTitle = summary
    ? `Phát hiện ${summary.slowSkuCount} sản phẩm chậm luân chuyển trên ${threshold} ngày`
    : "";
  const alertDesc  = summary
    ? `Tổng giá trị ứ đọng ước tính: ${fmtVnd(summary.lockedValue)} · Cần xem xét khuyến mãi hoặc điều chuyển kho`
    : "";

  const bucketLegend = buckets.map(b => `${b.label} (${b.count} SP)`).join("  ");

  return (
    <div className="warehouse-report-view">

      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <span className="filter-label">Tồn quá:</span>
        <div className="filter-group">
          {THRESHOLD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`f-btn${threshold === opt.value ? " on" : ""}`}
              type="button"
              onClick={() => setThreshold(opt.value)}
            >{opt.label}</button>
          ))}
        </div>
        <div className="filter-sep" />
        <select className="f-select" value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
          <option value={0}>Tất cả nhóm</option>
        </select>
        <select className="f-select" value={warehouseId} onChange={e => setWarehouseId(Number(e.target.value))}>
          <option value={0}>Tất cả kho</option>
          {warehouseList.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
        </select>
        <div className="filter-spacer" />
        <button className="btn btn-primary" type="button" onClick={fetchReport} disabled={isLoading}>
          {isLoading ? "Đang tải..." : "Lọc"}
        </button>
        {hasFetched && rows.length > 0 && (
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            style={{ marginLeft: 8, background: "transparent", border: "1px solid var(--primary-color)", color: "var(--primary-color)" }}
          >
            {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </button>
        )}
      </div>

      {/* ── Alert banner ── */}
      {!isLoading && summary && summary.slowSkuCount > 0 && (
        <div className="alert-banner">
          <span className="alert-banner__icon">⚠️</span>
          <div>
            <div className="alert-banner__title">{alertTitle}</div>
            <div className="alert-banner__desc" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(alertDesc.replace(fmtVnd(summary.lockedValue), `<b>${fmtVnd(summary.lockedValue)}</b>`)) }} />
          </div>
        </div>
      )}

      {/* ── KPI row ── */}
      <div className="kpi-row">
        {isLoading || !summary ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="kpi">
              <Skeleton h={13} w="60%" /><div style={{ height: 6 }} />
              <Skeleton h={30} w="70%" /><div style={{ height: 6 }} />
              <Skeleton h={12} w="65%" />
            </div>
          ))
        ) : (
          <>
            <div className="kpi">
              <div className="kpi-l">SP chậm &gt; {threshold} ngày</div>
              <div className="kpi-v r">{summary.slowSkuCount}</div>
              <div className={`kpi-d ${summary.slowSkuCount > 0 ? "dn" : "neu"}`}>
                {summary.slowSkuCount > 0 ? `Cần xử lý ${Math.min(summary.slowSkuCount, 99)} SP` : "Tốt — không có SP chậm"}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-l">Giá trị ứ đọng</div>
              <div className="kpi-v a">{fmtVnd(summary.lockedValue)}</div>
              <div className="kpi-d neu">
                {summary.lockedValuePct > 0 ? `${summary.lockedValuePct.toFixed(1)}% tổng tồn kho` : "Giá trị ứ đọng hiện tại"}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-l">Số ngày tồn TB</div>
              <div className="kpi-v">{summary.avgStockDays > 9000 ? "Chưa xuất" : `${Math.min(summary.avgStockDays, 999)} ngày`}</div>
              <div className="kpi-d neu">Trung bình nhóm chậm</div>
            </div>
            <div className="kpi">
              <div className="kpi-l">Đang xử lý (KM)</div>
              <div className="kpi-v g">{summary.promoCount}</div>
              <div className="kpi-d neu">Trong chiến dịch giảm giá</div>
            </div>
          </>
        )}
      </div>

      {/* ── Charts ── */}
      <div className="chart-row">
        <div className="chart-card">
          <div className="cc-title">Phân bổ theo số ngày tồn kho</div>
          <div className="cc-sub">Số sản phẩm chậm luân chuyển theo mức độ</div>
          {!isLoading && buckets.length > 0 && (
            <div className="legend">
              {buckets.map(b => (
                <div key={b.label} className="li">
                  <span className="ld" style={{ background: b.color }} />
                  {b.label} ({b.count} SP)
                </div>
              ))}
            </div>
          )}
          {isLoading ? <Skeleton h={280} /> : (
            buckets.length > 0
              ? <HighchartsReact highcharts={Highcharts} options={donutOptions} />
              : <div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>
                  {hasFetched ? `Không có SP nào tồn quá ${threshold} ngày 🎉` : ""}
                </div>
          )}
        </div>

        <div className="chart-card">
          <div className="cc-title">Top nhóm hàng chậm luân chuyển</div>
          <div className="cc-sub">Theo giá trị ứ đọng · Triệu đồng</div>
          {isLoading ? <Skeleton h={280} /> : (
            groups.length > 0
              ? <HighchartsReact highcharts={Highcharts} options={barOptions} />
              : <div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>
                  {hasFetched ? "Không có dữ liệu" : ""}
                </div>
          )}
        </div>
      </div>

      {/* ── Product table ── */}
      <div className="tbl-card">
        <div className="tbl-head">
          <h3>Danh sách hàng chậm luân chuyển (&gt; {threshold} ngày)</h3>
          <span className="tbl-meta">
            {hasFetched ? `${rows.length} sản phẩm · Sắp xếp theo số ngày tồn` : ""}
          </span>
        </div>
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Nhóm</th>
                <th className="r">Tồn SL</th>
                <th className="r">Ngày tồn</th>
                <th className="r">Giá vốn ứ đọng</th>
                <th className="r">Lần xuất cuối</th>
                <th>Đề xuất</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><Skeleton h={16} /></td>)}</tr>
                ))
              ) : rows.length > 0 ? (
                rows.map(row => {
                  const sugg = SUGGESTION_MAP[row.suggestion] ?? { label: row.suggestion, cls: "ba" };
                  const daysDisplay = row.stockDays >= 9000 ? "Chưa xuất" : `${row.stockDays} ngày`;
                  const daysCls = row.stockDays >= 9000 ? "vr" : row.stockDays > 180 ? "vr" : row.stockDays > 120 ? "vo" : "";
                  return (
                    <tr key={`${row.productId}_${row.variantId}_${row.warehouseName}`}>
                      <td>
                        <div className="table-primary">{row.productName}</div>
                        <div className="table-secondary">{row.sku}</div>
                      </td>
                      <td>{row.categoryName || "—"}</td>
                      <td className="r">{row.endStock.toLocaleString("vi-VN")}</td>
                      <td className={`r ${daysCls}`}><b>{daysDisplay}</b></td>
                      <td className="r va">{fmtVnd(row.lockedValue)}</td>
                      <td className="r">{row.lastExportDate ?? <span style={{ color: "#ef4444" }}>Chưa xuất</span>}</td>
                      <td><span className={`badge ${sugg.cls}`}>{sugg.label}</span></td>
                    </tr>
                  );
                })
              ) : hasFetched ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
                    Không có sản phẩm nào tồn quá {threshold} ngày 🎉
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes slow-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .vo { color: #f97316; }
      `}</style>
    </div>
  );
}