import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import WarehouseReportService, {
  IXntDailyPoint,
  IXntReportData,
  IXntSummary,
  IXntWarehouseRatio,
} from "services/WarehouseReportService";

// ─── Period helpers ───────────────────────────────────────────────────────────

type PeriodKey = "month" | "quarter" | "custom";

function getPeriodRange(key: PeriodKey, custom?: [string, string]): [string, string] {
  if (key === "month") {
    return [
      moment().startOf("month").format("DD/MM/YYYY"),
      moment().endOf("month").format("DD/MM/YYYY"),
    ];
  }
  if (key === "quarter") {
    return [
      moment().startOf("quarter").format("DD/MM/YYYY"),
      moment().endOf("quarter").format("DD/MM/YYYY"),
    ];
  }
  return custom ?? [
    moment().startOf("month").format("DD/MM/YYYY"),
    moment().endOf("month").format("DD/MM/YYYY"),
  ];
}

function getPeriodLabel(key: PeriodKey): string {
  if (key === "month")   return `Tháng ${moment().format("M/YYYY")}`;
  if (key === "quarter") return `Quý ${moment().quarter()}/${moment().year()}`;
  return "Tùy chỉnh";
}

// ─── Chart builders ───────────────────────────────────────────────────────────

const PALETTE = ["#1d4ed8", "#60a5fa", "#bfdbfe", "#93c5fd", "#3b82f6"];

function buildTrendOptions(series: IXntDailyPoint[]): Highcharts.Options {
  return {
    chart: { type: "column", height: 240, backgroundColor: "transparent" },
    xAxis: { categories: series.map(d => d.label), lineColor: "#e4e2d9" },
    yAxis: { title: { text: undefined }, gridLineColor: "rgba(0,0,0,0.055)" },
    legend: { enabled: false },
    tooltip: { shared: true },
    plotOptions: { column: { borderRadius: 3 } },
    series: [
      { type: "column", name: "Nhập kho", data: series.map(d => d.importQty), color: "#1d4ed8" },
      { type: "column", name: "Xuất kho", data: series.map(d => d.exportQty), color: "#f97316" },
    ],
  };
}

function buildRatioOptions(ratios: IXntWarehouseRatio[]): Highcharts.Options {
  const data = ratios.map((w, i) => ({
    name: w.warehouseName,
    y:    w.ratio,
    color: PALETTE[i % PALETTE.length],
  }));
  return {
    chart: { type: "pie", height: 240, backgroundColor: "transparent" },
    tooltip: { pointFormat: "<b>{point.name}: {point.y}%</b>" },
    plotOptions: { pie: { innerSize: "62%", borderWidth: 0, dataLabels: { enabled: false } } },
    legend: { enabled: false },
    series: [{ type: "pie", data }],
  };
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function fmtQty(n: number): string {
  return (n ?? 0).toLocaleString("vi-VN");
}

function fmtSign(n: number, prefix = "+"): string {
  const abs = Math.abs(n ?? 0).toLocaleString("vi-VN");
  return n >= 0 ? `${prefix}${abs}` : `−${abs}`;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton({ height = 24, width = "100%" }: { height?: number; width?: string }) {
  return (
    <div
      style={{
        height, width, borderRadius: 6,
        background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "xnt-shimmer 1.4s infinite",
      }}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WarehouseReportXntView() {
  const abortRef = useRef<AbortController | null>(null);

  // ── Filter state ──
  const [periodKey, setPeriodKey]     = useState<PeriodKey>("month");
  const [warehouseId, setWarehouseId] = useState(0);
  const [warehouseList, setWarehouseList] = useState<{ value: number; label: string }[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [hasFetched, setHasFetched]   = useState(false);

  // ── Data state ──
  const [data, setData] = useState<IXntReportData | null>(null);

  // ── Load warehouse list ──
  useEffect(() => {
    WarehouseReportService.getWarehouses().then(setWarehouseList);
  }, []);

  // ── Fetch report ──
  const fetchReport = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsLoading(true);

    const [from, to] = getPeriodRange(periodKey);
    const result = await WarehouseReportService.getXntReport(
      { warehouseId, fromTime: from, toTime: to, groupBy: "day" },
      ctrl.signal
    );
    if (!ctrl.signal.aborted) {
      setData(result);
      setHasFetched(true);
    }
    setIsLoading(false);
  }, [periodKey, warehouseId]);

  useEffect(() => {
    fetchReport();
    return () => abortRef.current?.abort();
  }, [fetchReport]);

  // ── Chart options (recalculate when data changes) ──
  const trendOptions = useMemo(
    () => buildTrendOptions(data?.dailySeries ?? []),
    [data?.dailySeries]
  );
  const ratioOptions = useMemo(
    () => buildRatioOptions(data?.warehouseRatio ?? []),
    [data?.warehouseRatio]
  );

  const summary = data?.summary;
  const productRows = data?.productRows ?? [];
  const warehouseRatio = data?.warehouseRatio ?? [];
  const periodLabel = getPeriodLabel(periodKey);

  // ── KPI items ──
  const kpis = summary ? [
    {
      label: "Tồn đầu kỳ",
      value: fmtQty(summary.openingQty),
      valueClass: "b",
      delta: `Đầu ${periodLabel}`,
      deltaClass: "neu",
    },
    {
      label: "Tổng nhập kỳ",
      value: fmtSign(summary.totalImport),
      valueClass: "g",
      delta: summary.importGrowth
        ? `${summary.importGrowth > 0 ? "↑" : "↓"} ${Math.abs(summary.importGrowth).toFixed(1)}% so kỳ trước`
        : "So với kỳ trước",
      deltaClass: summary.importGrowth >= 0 ? "up" : "dn",
    },
    {
      label: "Tổng xuất kỳ",
      value: `−${fmtQty(summary.totalExport)}`,
      valueClass: "r",
      delta: "Xuất bán + điều chuyển",
      deltaClass: "neu",
    },
    {
      label: "Tồn cuối kỳ",
      value: fmtQty(summary.closingQty),
      valueClass: "",
      delta: summary.closingQty - summary.openingQty >= 0
        ? `↑ ${fmtQty(summary.closingQty - summary.openingQty)} SL so đầu kỳ`
        : `↓ ${fmtQty(Math.abs(summary.closingQty - summary.openingQty))} SL so đầu kỳ`,
      deltaClass: summary.closingQty >= summary.openingQty ? "up" : "dn",
    },
  ] : null;

  return (
    <div className="warehouse-report-view">
      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <span className="filter-label">Kỳ:</span>
        <div className="filter-group">
          {(["month", "quarter", "custom"] as PeriodKey[]).map((key, i) => (
            <button
              key={key}
              className={`f-btn${periodKey === key ? " on" : ""}`}
              type="button"
              onClick={() => setPeriodKey(key)}
            >
              {key === "month"   ? getPeriodLabel("month")
               : key === "quarter" ? getPeriodLabel("quarter")
               : "Tùy chỉnh"}
            </button>
          ))}
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
        {isLoading || !kpis ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="kpi">
              <Skeleton height={14} width="60%" />
              <Skeleton height={32} width="80%" />
              <Skeleton height={12} width="70%" />
            </div>
          ))
        ) : (
          kpis.map(item => (
            <div key={item.label} className="kpi">
              <div className="kpi-l">{item.label}</div>
              <div className={`kpi-v ${item.valueClass}`}>{item.value}</div>
              <div className={`kpi-d ${item.deltaClass}`}>{item.delta}</div>
            </div>
          ))
        )}
      </div>

      {/* ── Chart row ── */}
      <div className="chart-row">
        <div className="chart-card">
          <div className="cc-title">Biến động nhập / xuất theo ngày</div>
          <div className="cc-sub">Theo số lượng sản phẩm trong {periodLabel}</div>
          <div className="legend">
            <div className="li"><span className="ld" style={{ background: "#1d4ed8" }} />Nhập kho</div>
            <div className="li"><span className="ld" style={{ background: "#f97316" }} />Xuất kho</div>
          </div>
          {isLoading ? (
            <Skeleton height={240} />
          ) : (
            <HighchartsReact highcharts={Highcharts} options={trendOptions} />
          )}
        </div>

        <div className="chart-card">
          <div className="cc-title">Phân bổ tồn kho theo kho</div>
          <div className="cc-sub">Tỷ trọng hàng tồn cuối kỳ</div>
          {isLoading ? (
            <Skeleton height={240} />
          ) : warehouseRatio.length > 0 ? (
            <>
              <div className="legend">
                {warehouseRatio.map((w, i) => (
                  <div key={w.warehouseId} className="li">
                    <span className="ld" style={{ background: PALETTE[i % PALETTE.length] }} />
                    {w.warehouseName} {w.ratio}%
                  </div>
                ))}
              </div>
              <HighchartsReact highcharts={Highcharts} options={ratioOptions} />
            </>
          ) : (
            <div style={{ padding: "2rem", color: "#999", textAlign: "center" }}>
              Không có dữ liệu tồn kho
            </div>
          )}
        </div>
      </div>

      {/* ── Product table ── */}
      <div className="tbl-card">
        <div className="tbl-head">
          <h3>Chi tiết nhập xuất tồn theo sản phẩm</h3>
          <span className="tbl-meta">
            {periodLabel}
            {hasFetched && ` · ${productRows.length} sản phẩm`}
          </span>
        </div>
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Mã SP</th>
                <th className="r">Tồn đầu</th>
                <th className="r">Nhập</th>
                <th className="r">Xuất</th>
                <th className="r">Tồn cuối</th>
                <th>Kho</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}><Skeleton height={16} /></td>
                    ))}
                  </tr>
                ))
              ) : productRows.length > 0 ? (
                productRows.map(row => (
                  <tr key={`${row.productId}_${row.variantId}_${row.warehouseName}`}>
                    <td>{row.productName}</td>
                    <td>{row.sku}</td>
                    <td className="r">{fmtQty(row.openingQty)}</td>
                    <td className="r vg">+{fmtQty(row.importQty)}</td>
                    <td className="r vr">−{fmtQty(row.exportQty)}</td>
                    <td className="r">{fmtQty(row.closingQty)}</td>
                    <td>{row.warehouseName}</td>
                  </tr>
                ))
              ) : hasFetched ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
                    Không có dữ liệu trong kỳ này
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes xnt-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}