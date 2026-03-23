import React, { useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { IReportCommonFilterRequest } from "model/report/ReportRequest";
import { IReportRevenueResponse } from "model/report/ReportResponse";
import {
  ISalesChannelRow,
  ISalesReportFull,
  ISalesReportSummary,
} from "model/report/ReportResponse";
import { IReportCommonProps } from "model/report/PropsModel";
import Loading from "components/loading";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { showToast } from "utils/common";
import "./ReportRevenue.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

type RevenueSeriesKey = "revenue" | "expense" | "income" | "debt";

// ─── Mock data — hiển thị khi API chưa về hoặc trả rỗng ──────────────────────

const MOCK_DAILY_SERIES: IReportRevenueResponse[] = [
  { time: "2026-03-10", revenue: 36000000, expense: 21000000, income: 15000000, debt: 6200000, date: "2026-03-10" },
  { time: "2026-03-11", revenue: 42000000, expense: 24500000, income: 17500000, debt: 6800000, date: "2026-03-11" },
  { time: "2026-03-12", revenue: 48000000, expense: 28200000, income: 19800000, debt: 7100000, date: "2026-03-12" },
  { time: "2026-03-13", revenue: 45000000, expense: 27100000, income: 17900000, debt: 6900000, date: "2026-03-13" },
  { time: "2026-03-14", revenue: 53000000, expense: 30500000, income: 22500000, debt: 7300000, date: "2026-03-14" },
  { time: "2026-03-15", revenue: 56000000, expense: 33100000, income: 22900000, debt: 7600000, date: "2026-03-15" },
  { time: "2026-03-16", revenue: 62000000, expense: 35800000, income: 26200000, debt: 8100000, date: "2026-03-16" },
];

const MOCK_SUMMARY: ISalesReportSummary = {
  revenue:    342000000,
  expense:    200200000,
  income:     141800000,
  debt:        50000000,
  latestDate: "10/03/2026",
};

const MOCK_CHANNEL_ROWS: ISalesChannelRow[] = [
  { saleflowId: 0, channelName: "Tại quầy (POS)",          channelDesc: "Bán Trực Tiếp Tại Cửa Hàng", orderCount: 612, revenue: 168000000, avgOrderValue: 274000, ratio: 0.491, trend: "UP",     trendPct: 12.5 },
  { saleflowId: 1, channelName: "Website bán hàng",         channelDesc: "Đơn Online Từ Web",           orderCount: 338, revenue:  96000000, avgOrderValue: 284000, ratio: 0.281, trend: "UP",     trendPct:  5.0 },
  { saleflowId: 2, channelName: "Fanpage / Zalo OA",        channelDesc: "Đơn Từ Social Inbox",         orderCount: 214, revenue:  52000000, avgOrderValue: 243000, ratio: 0.152, trend: "STABLE", trendPct:  0.0 },
  { saleflowId: 3, channelName: "Sàn thương mại điện tử",   channelDesc: "Shopee, Lazada, TikTok Shop",  orderCount: 120, revenue:  26000000, avgOrderValue: 217000, ratio: 0.076, trend: "DOWN",   trendPct: -3.2 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SERIES_META: Record<RevenueSeriesKey, { label: string; color: string }> = {
  revenue: { label: "Doanh thu", color: "#1d4ed8" },
  expense: { label: "Chi phí",   color: "#c2410c" },
  income:  { label: "Lợi nhuận", color: "#047857" },
  debt:    { label: "Công nợ",   color: "#b45309" },
};

/** Chuyển trend enum → label và CSS class cho badge */
function trendMeta(trend: string, trendPct?: number) {
  const pct = trendPct != null ? Math.abs(trendPct) : null;
  switch (trend) {
    case "UP":
      return {
        label: pct && pct >= 10 ? "↑ Tăng mạnh" : "↑ Tăng",
        className: "badge badge-green",
      };
    case "DOWN":
      return { label: "↓ Giảm", className: "badge badge-red" };
    case "STABLE":
    default:
      return { label: "→ Ổn định", className: "badge badge-amber" };
  }
}

/** Gọi API 4 — full report, 1 request duy nhất */
async function fetchSalesReport(
  params: IReportCommonFilterRequest,
  signal?: AbortSignal
): Promise<ISalesReportFull | null> {
  try {
    const res = await fetch(
      `${urlsApi.salesReport.full}${convertParamsToString({ ...params, branchId: params.branchId ?? 0 })}`,
      { method: "GET", signal }
    );
    if (!res.ok) return null;
    const json = await res.json();
    // Backend wrapper: { code, data } hoặc { code, result }
    const payload = json.data ?? json.result ?? json;
    // Validate tối thiểu
    if (!payload?.dailySeries && !payload?.summary) return null;
    return payload as ISalesReportFull;
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportRevenue(props: IReportCommonProps) {
  const { params, callback } = props;

  // daily series dùng cho biểu đồ — khởi tạo bằng mock
  const [listRevenue, setListRevenue] = useState<IReportRevenueResponse[]>(MOCK_DAILY_SERIES);
  // summary KPI riêng — khởi tạo bằng mock
  const [summaryKpi, setSummaryKpi] = useState<ISalesReportSummary | null>(MOCK_SUMMARY);
  // channel rows — khởi tạo bằng mock
  const [channelRows, setChannelRows] = useState<ISalesChannelRow[]>(MOCK_CHANNEL_ROWS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const getReport = async (paramsSearch: IReportCommonFilterRequest) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);

    const data = await fetchSalesReport(paramsSearch, controller.signal);

    if (data) {
      // API về có data → dùng real
      if (data.dailySeries?.length)  setListRevenue(data.dailySeries as any);
      if (data.summary)              setSummaryKpi(data.summary);
      if (data.channelRows?.length)  setChannelRows(data.channelRows);
      // Nếu bất kỳ trường nào rỗng → giữ mock của trường đó (không reset)
    }
    // data === null (lỗi mạng / 5xx) → giữ nguyên mock, không hiện toast gây nhiễu

    setIsLoading(false);
  };

  useEffect(() => {
    if (params.fromTime && params.toTime) {
      getReport(params);
    }
    return () => abortRef.current?.abort();
  }, [params]);

  useEffect(() => {
    callback?.(listRevenue);
  }, [callback, listRevenue]);

  // ── Derived ────────────────────────────────────────────────────────────────

  // KPI cards: dùng summaryKpi (từ API hoặc mock), KHÔNG tính lại từ daily series
  // vì API summary tính toàn kỳ, daily series chỉ là slice hiển thị
  const summaryCards = useMemo(
    () => [
      {
        key: "revenue",
        label: "Doanh thu thuần",
        color: "#2563eb",
        value: summaryKpi?.revenue ?? 0,
        subValue:
          params.fromTime && params.toTime
            ? `${params.fromTime} - ${params.toTime}`
            : " ",
      },
      {
        key: "expense",
        label: "Chi phí",
        color: "#c2410c",
        value: summaryKpi?.expense ?? 0,
        subValue: "Tổng chi trong kỳ",
      },
      {
        key: "income",
        label: "Lợi nhuận",
        color: "#047857",
        value: summaryKpi?.income ?? 0,
        subValue: "Sau khi trừ chi phí",
      },
      {
        key: "debt",
        label: "Công nợ",
        color: "#b45309",
        value: summaryKpi?.debt ?? 0,
        subValue: summaryKpi?.latestDate
          ? `Cập nhật tới ${summaryKpi.latestDate}`
          : " ",
      },
    ],
    [summaryKpi, params.fromTime, params.toTime]
  );

  const categories = useMemo(
    () =>
      listRevenue.map((item) => {
        const date = item.time || item.date;
        return `${moment(date).format("DD/MM")}<br/><span style="font-size:10px;color:#9a9890">${moment(date).format("ddd")}</span>`;
      }),
    [listRevenue]
  );

  const visibleSeries = useMemo(
    () =>
      (["revenue", "expense", "income", "debt"] as RevenueSeriesKey[]).map((key) => ({
        name: SERIES_META[key].label,
        data: listRevenue.map((item) => (item[key] || 0) / 1_000_000),
        color: SERIES_META[key].color,
      })),
    [listRevenue]
  );

  const chartRevenue = useMemo(
    () => ({
      chart: {
        type: "column",
        height: 360,
        backgroundColor: "transparent",
        style: { fontFamily: "Be Vietnam Pro, Roboto, sans-serif" },
        spacing: [12, 0, 12, 0],
      },
      title: { text: "" },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        useHtml: true,
        categories,
        crosshair: false,
        lineWidth: 0,
        tickWidth: 0,
        labels: { style: { color: "#9a9890", fontSize: "11px" } },
      },
      yAxis: {
        title: { text: "Triệu VNĐ", style: { color: "#56544c", fontSize: "12px", fontWeight: "500" } },
        gridLineColor: "rgba(0,0,0,0.06)",
        labels: { style: { color: "#9a9890", fontSize: "11px" } },
      },
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "#18180f",
        borderWidth: 0,
        borderRadius: 10,
        style: { color: "#ffffff" },
        pointFormat:
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;min-width:180px;"><span style="color:{series.color}">{series.name}</span><b>{point.y:.1f} triệu</b></div>',
      },
      plotOptions: {
        column: { borderWidth: 0, borderRadius: 4, pointPadding: 0.12, groupPadding: 0.16 },
      },
      series: visibleSeries,
    }),
    [categories, visibleSeries]
  );

  const chartTrend = useMemo(() => {
    const marginData = listRevenue.map((item) =>
      item.revenue ? Number((((item.income || 0) / item.revenue) * 100).toFixed(1)) : 0
    );
    const debtRatioData = listRevenue.map((item) =>
      item.revenue ? Number((((item.debt || 0) / item.revenue) * 100).toFixed(1)) : 0
    );

    return {
      chart: {
        type: "line",
        height: 360,
        backgroundColor: "transparent",
        style: { fontFamily: "Be Vietnam Pro, Roboto, sans-serif" },
        spacing: [12, 0, 12, 0],
      },
      title: { text: "" },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        categories: listRevenue.map((item) => moment(item.time || item.date).format("DD/MM")),
        lineWidth: 0,
        tickWidth: 0,
        labels: { style: { color: "#9a9890", fontSize: "11px" } },
      },
      yAxis: {
        title: { text: "%", style: { color: "#56544c", fontSize: "12px", fontWeight: "500" } },
        gridLineColor: "rgba(0,0,0,0.06)",
        labels: { style: { color: "#9a9890", fontSize: "11px" } },
      },
      tooltip: { shared: true, valueSuffix: "%" },
      plotOptions: {
        line: { marker: { enabled: true, radius: 3 }, lineWidth: 2.5 },
      },
      series: [
        { name: "Biên lợi nhuận", data: marginData,    color: "#047857" },
        { name: "Tỷ lệ công nợ",  data: debtRatioData, color: "#b45309" },
      ],
    };
  }, [listRevenue]);

  // Bảng channel: dùng state channelRows (real hoặc mock)
  const channelTableRows = useMemo(
    () =>
      channelRows.map((row) => {
        const avgOrder = row.avgOrderValue ?? (row.orderCount ? Math.round(row.revenue / row.orderCount) : 0);
        const tm = trendMeta(row.trend, row.trendPct);
        return {
          name:     row.channelName,
          desc:     row.channelDesc ?? "",
          orders:   row.orderCount,
          revenue:  row.revenue,
          avgOrder,
          ratio:    `${(row.ratio * 100).toFixed(1)}%`,
          trend:    tm,
        };
      }),
    [channelRows]
  );

  const channelMeta = useMemo(() => {
    const totalOrders  = channelTableRows.reduce((s, r) => s + r.orders, 0);
    const totalRevenue = channelTableRows.reduce((s, r) => s + r.revenue, 0);
    const avgOrder     = channelTableRows.length
      ? Math.round(channelTableRows.reduce((s, r) => s + r.avgOrder, 0) / channelTableRows.length)
      : 0;
    return { totalOrders, totalRevenue, avgOrder };
  }, [channelTableRows]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading) return <Loading />;

  return (
    <div className="page__report--revenue">
      {/* ── KPI Cards ── */}
      <div className="kpi-row">
        {summaryCards.map((item) => (
          <button key={item.key} className="kpi kpi-button" onClick={() => undefined} type="button">
            <div className="kpi-l">{item.label}</div>
            <div className="kpi-v" style={{ color: item.color }}>
              {item.value === null ? "--" : `${formatCurrency(item.value || 0, ".", "")}đ`}
            </div>
            <div className="kpi-meta">{item.subValue}</div>
          </button>
        ))}
      </div>

      {/* ── Biểu đồ ── */}
      <div className="chart-row">
        <div className="chart-card">
          <div className="cc-head">
            <div>
              <div className="cc-title">Diễn biến doanh thu theo ngày</div>
              <div className="cc-sub">Doanh thu, chi phí, lợi nhuận và công nợ trong kỳ</div>
            </div>
          </div>
          <div className="legend">
            {(Object.keys(SERIES_META) as RevenueSeriesKey[]).map((key) => (
              <div className="li" key={key}>
                <span className="ld" style={{ background: SERIES_META[key].color }} />
                {SERIES_META[key].label}
              </div>
            ))}
          </div>
          <div className="chart-wrap">
            <HighchartsReact highcharts={Highcharts} allowChartUpdate options={chartRevenue} />
          </div>
        </div>

        <div className="chart-card">
          <div className="cc-head">
            <div>
              <div className="cc-title">Top sản phẩm bán chạy</div>
              <div className="cc-sub">Theo hiệu suất doanh thu và lợi nhuận trong kỳ</div>
            </div>
          </div>
          <div className="legend">
            <div className="li"><span className="ld" style={{ background: "#047857" }} />Biên lợi nhuận</div>
            <div className="li"><span className="ld" style={{ background: "#b45309" }} />Tỷ lệ công nợ</div>
          </div>
          <div className="chart-wrap">
            <HighchartsReact highcharts={Highcharts} allowChartUpdate options={chartTrend} />
          </div>
        </div>
      </div>

      {/* ── Bảng kênh bán hàng ── */}
      <div className="tbl-card">
        <div className="tbl-head">
          <h3>Kênh bán hàng</h3>
          <span className="tbl-meta">
            {channelTableRows.length} kênh hoạt động
          </span>
        </div>
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr>
                <th>Kênh bán hàng</th>
                <th className="r">Số đơn</th>
                <th className="r">Doanh thu</th>
                <th className="r">Giá trị TB</th>
                <th className="r">Tỷ trọng</th>
                <th>Xu hướng</th>
              </tr>
            </thead>
            <tbody>
              {channelTableRows.map((item) => (
                <tr key={item.name}>
                  <td>
                    <div className="table-primary">{item.name}</div>
                    <div className="table-secondary">{item.desc}</div>
                  </td>
                  <td className="r">{item.orders.toLocaleString("vi-VN")}</td>
                  <td className="r vb">{formatCurrency(item.revenue, ".", "")}đ</td>
                  <td className="r">{formatCurrency(item.avgOrder, ".", "")}đ</td>
                  <td className="r">{item.ratio}</td>
                  <td><span className={item.trend.className}>{item.trend.label}</span></td>
                </tr>
              ))}
              <tr className="summary-row">
                <td><div className="table-primary">Tổng cộng</div></td>
                <td className="r">{channelMeta.totalOrders.toLocaleString("vi-VN")}</td>
                <td className="r vb">{formatCurrency(channelMeta.totalRevenue, ".", "")}đ</td>
                <td className="r">{formatCurrency(channelMeta.avgOrder, ".", "")}đ</td>
                <td className="r">100%</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}