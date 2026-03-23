import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import WarehouseReportService, {
  ICostProductRow,
  ICostReportData,
  ICostSummary,
} from "services/WarehouseReportService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type PeriodKey = "month" | "quarter" | "custom";

function getPeriodRange(key: PeriodKey): [string, string] {
  if (key === "month")
    return [moment().startOf("month").format("DD/MM/YYYY"), moment().endOf("month").format("DD/MM/YYYY")];
  return [moment().startOf("quarter").format("DD/MM/YYYY"), moment().endOf("quarter").format("DD/MM/YYYY")];
}

function fmtVnd(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} tỷ`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  return n.toLocaleString("vi-VN") + "đ";
}

function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function Skeleton({ h = 20, w = "100%" }: { h?: number; w?: string }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: 5,
      background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
      backgroundSize: "200% 100%", animation: "cost-shimmer 1.4s infinite",
    }} />
  );
}

// ─── Chart builders ───────────────────────────────────────────────────────────

const COST_PALETTE = ["#b45309","#d97706","#f59e0b","#fbbf24","#fde68a","#92400e","#78350f"];

function buildGroupChart(categories: { name: string; value: number }[]): Highcharts.Options {
  return {
    chart: { type: "bar", height: Math.max(220, categories.length * 40 + 60), backgroundColor: "transparent" },
    xAxis: { categories: categories.map(c => c.name), lineColor: "#e4e2d9" },
    yAxis: { title: { text: undefined }, gridLineColor: "rgba(0,0,0,0.055)" },
    legend: { enabled: false },
    tooltip: { pointFormat: "<b>{point.y:.1f}M</b>" },
    plotOptions: { bar: { borderRadius: 4, colorByPoint: true } },
    colors: COST_PALETTE,
    series: [{ type: "bar", name: "Giá trị tồn (triệu đồng)", data: categories.map(c => c.value) }],
  };
}

function buildTrendChart(
  labels: string[],
  inventoryValues: number[],
  costValues: number[]
): Highcharts.Options {
  return {
    chart: { type: "column", height: 240, backgroundColor: "transparent" },
    xAxis: { categories: labels, lineColor: "#e4e2d9" },
    yAxis: { title: { text: undefined }, gridLineColor: "rgba(0,0,0,0.055)" },
    tooltip: { shared: true, pointFormat: "<span style=\"color:{series.color}\">{series.name}</span>: <b>{point.y:.0f}M</b><br/>" },
    plotOptions: { column: { borderRadius: 3 } },
    series: [
      { type: "column", name: "Giá trị tồn", data: inventoryValues, color: "#047857" },
      { type: "column", name: "Giá vốn tiêu tốn", data: costValues, color: "#f59e0b" },
    ],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WarehouseReportCostView() {
  const abortRef = useRef<AbortController | null>(null);

  const [periodKey, setPeriodKey]       = useState<PeriodKey>("month");
  const [costMethod, setCostMethod]     = useState<"AVG" | "FIFO">("AVG");
  const [warehouseId, setWarehouseId]   = useState(0);
  const [warehouseList, setWarehouseList] = useState<{ value: number; label: string }[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [hasFetched, setHasFetched]     = useState(false);
  const [data, setData]                 = useState<ICostReportData | null>(null);

  useEffect(() => {
    WarehouseReportService.getWarehouses().then(setWarehouseList);
  }, []);

  const fetchReport = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsLoading(true);
    const [from, to] = getPeriodRange(periodKey);
    const result = await WarehouseReportService.getCostReport(
      { warehouseId, fromTime: from, toTime: to, groupBy: "month", costMethod },
      ctrl.signal
    );
    if (!ctrl.signal.aborted) {
      setData(result);
      setHasFetched(true);
    }
    setIsLoading(false);
  }, [periodKey, warehouseId, costMethod]);

  useEffect(() => {
    fetchReport();
    return () => abortRef.current?.abort();
  }, [fetchReport]);

  // ── Derived chart data ──
  const groupChartData = useMemo(() =>
    (data?.categoryValues ?? []).map(c => ({ name: c.categoryName || "Khác", value: c.stockValue })),
    [data?.categoryValues]
  );

  // Tính inventoryValue từ productRows: tổng stockValue theo từng period (dùng costTrend labels)
  const trendLabels        = (data?.costTrend ?? []).map(t => t.period);
  const trendCostValues    = (data?.costTrend ?? []).map(t => t.costValue);
  // inventoryValue chưa có từ backend — hiển thị 0 hoặc ẩn series
  const trendInvValues     = (data?.costTrend ?? []).map(() => 0);

  const groupOptions = useMemo(() => buildGroupChart(groupChartData), [groupChartData]);
  const trendOptions = useMemo(
    () => buildTrendChart(trendLabels, trendInvValues, trendCostValues),
    [trendLabels, trendCostValues]
  );

  const summary = data?.summary;
  const productRows = data?.productRows ?? [];

  const periodLabel = periodKey === "month"
    ? `Tháng ${moment().format("M/YYYY")}`
    : `Quý ${moment().quarter()}/${moment().year()}`;

  return (
    <div className="warehouse-report-view">

      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <span className="filter-label">Phương pháp:</span>
        <div className="filter-group">
          <button
            className={`f-btn${costMethod === "AVG" ? " on" : ""}`}
            type="button"
            onClick={() => setCostMethod("AVG")}
          >Bình quân</button>
          <button
            className={`f-btn${costMethod === "FIFO" ? " on" : ""}`}
            type="button"
            onClick={() => setCostMethod("FIFO")}
            title="Lấy giá vốn của lô nhập cũ nhất còn tồn"
          >FIFO</button>
        </div>
        <div className="filter-sep" />
        <select
          className="f-select"
          value={warehouseId}
          onChange={e => setWarehouseId(Number(e.target.value))}
        >
          <option value={0}>Tất cả kho</option>
          {warehouseList.map(w => (
            <option key={w.value} value={w.value}>{w.label}</option>
          ))}
        </select>
        <div className="filter-spacer" />
        <button
          className="btn btn-primary"
          type="button"
          onClick={fetchReport}
          disabled={isLoading}
        >
          {isLoading ? "Đang tải..." : "Xem báo cáo"}
        </button>
      </div>

      {/* ── KPI row ── */}
      <div className="kpi-row">
        {isLoading || !summary ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="kpi">
              <Skeleton h={13} w="60%" /><div style={{ height: 6 }} />
              <Skeleton h={30} w="75%" /><div style={{ height: 6 }} />
              <Skeleton h={12} w="65%" />
            </div>
          ))
        ) : (
          <>
            <div className="kpi">
              <div className="kpi-l">Giá trị tồn kho</div>
              <div className="kpi-v a">{fmtVnd(summary.totalStockValue)}</div>
              <div className="kpi-d neu">Giá vốn toàn kho hiện tại</div>
            </div>
            <div className="kpi">
              <div className="kpi-l">Giá vốn TB / đơn vị</div>
              <div className="kpi-v b">{fmtVnd(summary.avgUnitCost)}</div>
              <div className="kpi-d neu">Theo bình quân cuối kỳ</div>
            </div>
            <div className="kpi">
              <div className="kpi-l">Nhóm hàng giá vốn cao</div>
              <div className="kpi-v r">{summary.highCostSkuCount}</div>
              <div className="kpi-d dn">Cần kiểm soát nhập hàng</div>
            </div>
            <div className="kpi">
              <div className="kpi-l">Biên lợi nhuận gộp TB</div>
              <div className="kpi-v g">{fmtPct(summary.avgGrossMarginPct)}</div>
              <div className="kpi-d neu">{periodLabel}</div>
            </div>
          </>
        )}
      </div>

      {/* ── Charts ── */}
      <div className="chart-row">
        <div className="chart-card">
          <div className="cc-title">Giá trị tồn theo nhóm hàng</div>
          <div className="cc-sub">Đơn vị: triệu đồng</div>
          {isLoading ? <Skeleton h={240} /> : (
            groupChartData.length > 0
              ? <HighchartsReact highcharts={Highcharts} options={groupOptions} />
              : <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>Không có dữ liệu</div>
          )}
        </div>

        <div className="chart-card">
          <div className="cc-title">Xu hướng giá vốn theo kỳ</div>
          <div className="cc-sub">So sánh giá trị tồn và giá vốn</div>
          <div className="legend">
            <div className="li"><span className="ld" style={{ background: "#047857" }} />Giá trị tồn</div>
            <div className="li"><span className="ld" style={{ background: "#f59e0b" }} />Giá vốn</div>
          </div>
          {isLoading ? <Skeleton h={240} /> : (
            trendLabels.length > 0
              ? <HighchartsReact highcharts={Highcharts} options={trendOptions} />
              : <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>Không có dữ liệu</div>
          )}
        </div>
      </div>

      {/* ── Product table ── */}
      <div className="tbl-card">
        <div className="tbl-head">
          <h3>Chi tiết giá vốn theo sản phẩm</h3>
          <span className="tbl-meta">
            {hasFetched ? `${productRows.length} sản phẩm` : ""}
          </span>
        </div>
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Mã SP</th>
                <th>Nhóm hàng</th>
                <th className="r">Tồn SL</th>
                <th className="r">Giá vốn</th>
                <th className="r">Giá trị tồn</th>
                <th className="r">Giá bán TB</th>
                <th className="r">Lợi nhuận gộp</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}><Skeleton h={16} /></td>
                    ))}
                  </tr>
                ))
              ) : productRows.length > 0 ? (
                productRows.map(row => {
                  const margin = row.grossMarginPct;
                  const marginCls = margin >= 30 ? "vg" : margin >= 15 ? "va" : "vr";
                  return (
                    <tr key={`${row.productId}_${row.variantId}_${row.warehouseName}`}>
                      <td>{row.productName}</td>
                      <td>{row.sku}</td>
                      <td><span style={{ fontSize: "1.2rem", color: "#888" }}>{row.categoryName || "—"}</span></td>
                      <td className="r">{row.endStock.toLocaleString("vi-VN")}</td>
                      <td className="r">{fmtVnd(row.avgCost)}</td>
                      <td className={`r va`}>{fmtVnd(row.stockValue)}</td>
                      <td className="r">{row.sellingPrice > 0 ? fmtVnd(row.sellingPrice) : "—"}</td>
                      <td className={`r ${marginCls}`}>
                        {row.grossMarginPct > 0 ? fmtPct(row.grossMarginPct) : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : hasFetched ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
                    Không có dữ liệu trong kỳ này
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes cost-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}