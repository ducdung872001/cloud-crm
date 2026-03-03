import React, { Fragment, useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Loading from "components/loading";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  MOCK_REPORT_SUMMARY,
  mockGetReportChart,
  mockGetReportByPartner,
} from "../ShippingMockData";
// import ShippingService from "services/ShippingService"; // TODO: bật khi có API
import "./ShippingReport.scss";

// ---- Màu sắc biểu đồ ----
const COLOR_DELIVERED = "#10b981";
const COLOR_RETURNED  = "#f43f5e";
const COLOR_TRANSIT   = "#3b82f6";
const COLOR_PENDING   = "#f59e0b";
const COLOR_PARTNER   = ["#3b82f6", "#10b981", "#f97316"];

const PARTNER_OPTIONS = [
  { value: 0, label: "Tất cả hãng" },
  { value: 1, label: "GHTK" },
  { value: 2, label: "Viettel Post" },
  { value: 3, label: "GHN" },
];

const GROUP_OPTIONS = [
  { value: "day",   label: "Theo ngày" },
  { value: "week",  label: "Theo tuần" },
  { value: "month", label: "Theo tháng" },
];

// ---- Highcharts global defaults ----
Highcharts.setOptions({
  lang: {
    thousandsSep: ".",
    decimalPoint: ",",
  },
  chart: {
    style: { fontFamily: "inherit" },
  },
});

export default function ShippingReport() {
  document.title = "Báo cáo vận chuyển";
  const navigate = useNavigate();

  const [isLoading, setIsLoading]       = useState(false);
  const [partnerId, setPartnerId]       = useState(0);
  const [groupBy, setGroupBy]           = useState("day");
  const [dateRange, setDateRange]       = useState<[string, string]>([
    moment().subtract(29, "days").format("YYYY-MM-DD"),
    moment().format("YYYY-MM-DD"),
  ]);

  const [summary, setSummary]           = useState(MOCK_REPORT_SUMMARY);
  const [chartData, setChartData]       = useState<any[]>([]);
  const [partnerData, setPartnerData]   = useState<any[]>([]);
  const [activeMetric, setActiveMetric] = useState<"orders" | "cod">("orders");

  useEffect(() => { loadAll(); }, [partnerId, groupBy, dateRange]); // eslint-disable-line

  const loadAll = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    const chartRes   = mockGetReportChart();
    const partnerRes = mockGetReportByPartner();
    setChartData(chartRes.result.items);
    setPartnerData(partnerRes.result.items);
    setSummary(MOCK_REPORT_SUMMARY);
    setIsLoading(false);
  };

  // ============================================================
  // Highcharts option builders
  // ============================================================

  // Area chart – Xu hướng đơn hàng / COD
  const areaChartOptions = useMemo((): Highcharts.Options => {
    const categories = chartData.map((d) => d.date);

    if (activeMetric === "orders") {
      return {
        chart: { type: "area", height: 260, backgroundColor: "transparent", spacingTop: 10, spacingRight: 20, spacingBottom: 10, spacingLeft: 10 },
        title: { text: undefined },
        credits: { enabled: false },
        legend: { enabled: false },
        xAxis: {
          categories,
          tickLength: 0,
          labels: { style: { fontSize: "11px", color: "#9ca3af" } },
          lineColor: "#e5e7eb",
        },
        yAxis: {
          title: { text: undefined },
          gridLineColor: "#f3f4f6",
          labels: { style: { fontSize: "11px", color: "#9ca3af" } },
        },
        tooltip: {
          shared: true,
          backgroundColor: "#fff",
          borderColor: "#e5e7eb",
          borderRadius: 10,
          style: { fontSize: "12.5px" },
          valueSuffix: " đơn",
        },
        plotOptions: {
          area: {
            marker: { enabled: false, states: { hover: { enabled: true, radius: 4 } } },
            lineWidth: 2,
          },
        },
        series: [
          {
            type: "area",
            name: "Đã giao",
            data: chartData.map((d) => d.deliveredOrders),
            color: COLOR_DELIVERED,
            fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, Highcharts.color(COLOR_DELIVERED).setOpacity(0.2).get("rgba") as string],
                [1, Highcharts.color(COLOR_DELIVERED).setOpacity(0).get("rgba") as string],
              ],
            },
          },
          {
            type: "area",
            name: "Hoàn hàng",
            data: chartData.map((d) => d.returnedOrders),
            color: COLOR_RETURNED,
            fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, Highcharts.color(COLOR_RETURNED).setOpacity(0.15).get("rgba") as string],
                [1, Highcharts.color(COLOR_RETURNED).setOpacity(0).get("rgba") as string],
              ],
            },
          },
        ],
      };
    }

    // COD metric
    return {
      chart: { type: "area", height: 260, backgroundColor: "transparent", margin: [10, 20, 30, 65] },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        categories,
        tickLength: 0,
        labels: { style: { fontSize: "11px", color: "#9ca3af" } },
        lineColor: "#e5e7eb",
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: "#f3f4f6",
        labels: {
          style: { fontSize: "11px", color: "#9ca3af" },
          formatter() { return (this.value as number / 1_000_000).toFixed(1) + "M"; },
        },
      },
      tooltip: {
        shared: true,
        backgroundColor: "#fff",
        borderColor: "#e5e7eb",
        borderRadius: 10,
        style: { fontSize: "12.5px" },
        formatter() {
          const pts = (this as any).points;
          return `<b>${this.x}</b><br/>${pts.map((p: any) =>
            `<span style="color:${p.color}">●</span> COD: <b>${formatCurrency(p.y)} đ</b>`
          ).join("<br/>")}`;
        },
      },
      plotOptions: {
        area: {
          marker: { enabled: false, states: { hover: { enabled: true, radius: 4 } } },
          lineWidth: 2,
        },
      },
      series: [
        {
          type: "area",
          name: "COD (đ)",
          data: chartData.map((d) => d.codAmount),
          color: COLOR_PENDING,
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, Highcharts.color(COLOR_PENDING).setOpacity(0.25).get("rgba") as string],
              [1, Highcharts.color(COLOR_PENDING).setOpacity(0).get("rgba") as string],
            ],
          },
        },
      ],
    };
  }, [chartData, activeMetric]);

  // Pie / Donut chart – Tỷ lệ trạng thái
  const donutChartOptions = useMemo((): Highcharts.Options => ({
    chart: { type: "pie", height: 210, backgroundColor: "transparent", margin: [0, 0, 0, 0] },
    title: { text: undefined },
    credits: { enabled: false },
    legend: { enabled: false },
    tooltip: {
      pointFormat: "<b>{point.y} đơn</b> ({point.percentage:.1f}%)",
      backgroundColor: "#fff",
      borderColor: "#e5e7eb",
      borderRadius: 8,
      style: { fontSize: "12px" },
    },
    plotOptions: {
      pie: {
        innerSize: "62%",
        dataLabels: { enabled: false },
        borderWidth: 0,
        states: { hover: { brightness: 0.08 } },
      },
    },
    series: [
      {
        type: "pie",
        name: "Đơn hàng",
        data: [
          { name: "Đã giao",   y: summary.deliveredOrders,  color: COLOR_DELIVERED },
          { name: "Đang giao", y: summary.inTransitOrders,  color: COLOR_TRANSIT   },
          { name: "Chờ lấy",   y: summary.pendingOrders,    color: COLOR_PENDING   },
          { name: "Hoàn hàng", y: summary.returnedOrders,   color: COLOR_RETURNED  },
        ],
      },
    ],
  }), [summary]);

  // Bar chart – So sánh theo hãng
  const barChartOptions = useMemo((): Highcharts.Options => ({
    chart: { type: "column", height: 230, backgroundColor: "transparent", spacingTop: 10, spacingRight: 20, spacingBottom: 10, spacingLeft: 10 },
    title: { text: undefined },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      categories: partnerData.map((d) => d.partnerName),
      tickLength: 0,
      labels: { style: { fontSize: "12px", color: "#374151" } },
      lineColor: "transparent",
    },
    yAxis: {
      title: { text: undefined },
      gridLineColor: "#f3f4f6",
      labels: { style: { fontSize: "11px", color: "#9ca3af" } },
    },
    tooltip: {
      shared: true,
      backgroundColor: "#fff",
      borderColor: "#e5e7eb",
      borderRadius: 10,
      style: { fontSize: "12.5px" },
      valueSuffix: " đơn",
    },
    plotOptions: {
      column: {
        borderRadius: 4,
        groupPadding: 0.15,
        pointPadding: 0.05,
        dataLabels: { enabled: false },
      },
    },
    series: [
      {
        type: "column",
        name: "Đã giao",
        data: partnerData.map((d, i) => ({ y: d.deliveredOrders, color: COLOR_PARTNER[i] })),
      },
      {
        type: "column",
        name: "Hoàn hàng",
        data: partnerData.map((d) => d.returnedOrders),
        color: COLOR_RETURNED,
      },
    ],
  }), [partnerData]);

  // ---- Donut legend data ----
  const donutLegend = [
    { name: "Đã giao",   value: summary.deliveredOrders,  color: COLOR_DELIVERED },
    { name: "Đang giao", value: summary.inTransitOrders,  color: COLOR_TRANSIT   },
    { name: "Chờ lấy",   value: summary.pendingOrders,    color: COLOR_PENDING   },
    { name: "Hoàn hàng", value: summary.returnedOrders,   color: COLOR_RETURNED  },
  ];

  // ---- KPI Cards ----
  const kpiCards = [
    { label: "Tổng đơn vận chuyển",  value: summary.totalOrders,      icon: "Package",      color: "#3b82f6", bg: "#eff6ff",  suffix: "đơn",  trend: "+12%", trendUp: true },
    { label: "Tỷ lệ giao thành công",value: summary.successRate,       icon: "CheckCircle",  color: "#10b981", bg: "#ecfdf5",  suffix: "%",    trend: "+2.3%",trendUp: true,  isPercent: true },
    { label: "Tổng tiền thu hộ (COD)",value: summary.totalCodAmount,   icon: "Money",        color: "#f59e0b", bg: "#fffbeb",  suffix: "đ",    trend: "+8%",  trendUp: true,  isCurrency: true },
    { label: "Đơn hoàn hàng",        value: summary.returnedOrders,    icon: "ArrowLeft",    color: "#f43f5e", bg: "#fff1f2",  suffix: "đơn",  trend: "-1",   trendUp: false },
    { label: "Tổng phí vận chuyển",  value: summary.totalShippingFee,  icon: "Tag",          color: "#8b5cf6", bg: "#f5f3ff",  suffix: "đ",    trend: "+5%",  trendUp: true,  isCurrency: true },
  ];

  const titleActions: ITitleActions = { actions: [], actions_extra: [] };

  return (
    <Fragment>
      <div className="page-content page-shipping-report">

        <div className="page-back" onClick={() => navigate("/shipping")}>
          <Icon name="ArrowLeft" />
          <span>Quay lại danh sách vận chuyển</span>
        </div>

        <TitleAction title="Báo cáo Vận chuyển" titleActions={titleActions} />

        {/* ========== BỘ LỌC ========== */}
        <div className="report-filters">
          <div className="filter-item">
            <label>Hãng vận chuyển</label>
            <SelectCustom
              id="partnerId" name="partnerId" options={PARTNER_OPTIONS} fill
              value={partnerId} onChange={(e) => setPartnerId(e.value)}
            />
          </div>
          <div className="filter-item">
            <label>Nhóm theo</label>
            <SelectCustom
              id="groupBy" name="groupBy" options={GROUP_OPTIONS} fill
              value={groupBy} onChange={(e) => setGroupBy(e.value)}
            />
          </div>
          <div className="filter-item filter-item--date">
            <label>Khoảng thời gian</label>
            <DatePickerCustom value={dateRange} onChange={(range) => setDateRange(range)} placeholder="Chọn khoảng ngày..." />
          </div>
          <button className="btn-apply-filter" onClick={loadAll}>
            <Icon name="Search" /> Áp dụng
          </button>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <>
            {/* ========== KPI CARDS ========== */}
            <div className="kpi-grid">
              {kpiCards.map((card) => (
                <div
                  key={card.label}
                  className="kpi-card"
                  style={{ "--kpi-color": card.color, "--kpi-bg": card.bg } as React.CSSProperties}
                >
                  <div className="kpi-card__icon"><Icon name={card.icon} /></div>
                  <div className="kpi-card__body">
                    <div className="kpi-card__label">{card.label}</div>
                    <div className="kpi-card__value">
                      {card.isCurrency
                        ? formatCurrency(card.value) + " đ"
                        : card.isPercent
                        ? card.value + "%"
                        : card.value.toLocaleString("vi-VN") + " " + card.suffix}
                    </div>
                  </div>
                  <div className={`kpi-card__trend ${card.trendUp ? "up" : "down"}`}>
                    <Icon name={card.trendUp ? "TrendingUp" : "TrendingDown"} />
                    {card.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* ========== HÀNG BIỂU ĐỒ CHÍNH ========== */}
            <div className="chart-row">

              {/* Biểu đồ area – Xu hướng */}
              <div className="chart-card chart-card--main">
                <div className="chart-card__header">
                  <div className="chart-card__title">
                    <Icon name="TrendingUp" /> Xu hướng đơn hàng
                  </div>
                  <div className="metric-toggle">
                    <button className={activeMetric === "orders" ? "active" : ""} onClick={() => setActiveMetric("orders")}>
                      Đơn hàng
                    </button>
                    <button className={activeMetric === "cod" ? "active" : ""} onClick={() => setActiveMetric("cod")}>
                      Doanh thu COD
                    </button>
                  </div>
                </div>
                <div className="chart-body">
                  <HighchartsReact highcharts={Highcharts} options={areaChartOptions} />
                </div>
                {activeMetric === "orders" && (
                  <div className="chart-legend-row">
                    <span className="chart-legend-item">
                      <span className="chart-legend-dot" style={{ background: "#10b981" }} />
                      Đã giao
                    </span>
                    <span className="chart-legend-item">
                      <span className="chart-legend-dot" style={{ background: "#f43f5e" }} />
                      Hoàn hàng
                    </span>
                  </div>
                )}
              </div>

              {/* Donut chart – Tỷ lệ trạng thái */}
              <div className="chart-card chart-card--donut">
                <div className="chart-card__header">
                  <div className="chart-card__title">
                    <Icon name="PieChart" /> Tỷ lệ trạng thái
                  </div>
                </div>
                <div className="chart-body chart-body--donut">
                  <HighchartsReact highcharts={Highcharts} options={donutChartOptions} />
                </div>
                <div className="donut-legend">
                  {donutLegend.map((d) => (
                    <div key={d.name} className="donut-legend__item">
                      <span className="donut-legend__dot" style={{ background: d.color }} />
                      <span className="donut-legend__name">{d.name}</span>
                      <span className="donut-legend__val">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ========== BIỂU ĐỒ CỘT THEO HÃNG ========== */}
            <div className="chart-card chart-card--bar">
              <div className="chart-card__header">
                <div className="chart-card__title">
                  <Icon name="BarChart2" /> So sánh hiệu suất theo hãng vận chuyển
                </div>
              </div>
              <div className="chart-body">
                <HighchartsReact highcharts={Highcharts} options={barChartOptions} />
              </div>
              <div className="chart-legend-row">
                <span className="chart-legend-item">
                  <span className="chart-legend-dot" style={{ background: "#3b82f6" }} />
                  Đã giao
                </span>
                <span className="chart-legend-item">
                  <span className="chart-legend-dot" style={{ background: "#f43f5e" }} />
                  Hoàn hàng
                </span>
              </div>
            </div>

            {/* ========== BẢNG THỐNG KÊ THEO HÃNG ========== */}
            <div className="report-table-card">
              <div className="report-table-card__header">
                <div className="chart-card__title">
                  <Icon name="Table" /> Chi tiết theo hãng vận chuyển
                </div>
              </div>
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Hãng vận chuyển</th>
                      <th className="text-right">Tổng đơn</th>
                      <th className="text-right">Đã giao</th>
                      <th className="text-right">Đang giao</th>
                      <th className="text-right">Hoàn hàng</th>
                      <th className="text-right">Tỷ lệ thành công</th>
                      <th className="text-right">Tổng COD</th>
                      <th className="text-right">Phí vận chuyển</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerData.map((row, idx) => (
                      <tr key={row.partnerId}>
                        <td>
                          <span className="partner-dot" style={{ background: COLOR_PARTNER[idx] }} />
                          {row.partnerName}
                        </td>
                        <td className="text-right font-semibold">{row.totalOrders}</td>
                        <td className="text-right text-green">{row.deliveredOrders}</td>
                        <td className="text-right text-blue">{row.inTransitOrders}</td>
                        <td className="text-right text-red">{row.returnedOrders}</td>
                        <td className="text-right">
                          <div className="success-rate-wrap">
                            <div className="success-rate-bar">
                              <div className="success-rate-fill" style={{ width: row.successRate + "%", background: COLOR_PARTNER[idx] }} />
                            </div>
                            <span className="success-rate-pct">{row.successRate}%</span>
                          </div>
                        </td>
                        <td className="text-right">{formatCurrency(row.totalCodAmount)} đ</td>
                        <td className="text-right">{formatCurrency(row.totalShippingFee)} đ</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td><strong>Tổng cộng</strong></td>
                      <td className="text-right"><strong>{summary.totalOrders}</strong></td>
                      <td className="text-right text-green"><strong>{summary.deliveredOrders}</strong></td>
                      <td className="text-right text-blue"><strong>{summary.inTransitOrders}</strong></td>
                      <td className="text-right text-red"><strong>{summary.returnedOrders}</strong></td>
                      <td className="text-right"><span className="success-rate-pct"><strong>{summary.successRate}%</strong></span></td>
                      <td className="text-right"><strong>{formatCurrency(summary.totalCodAmount)} đ</strong></td>
                      <td className="text-right"><strong>{formatCurrency(summary.totalShippingFee)} đ</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Fragment>
  );
}