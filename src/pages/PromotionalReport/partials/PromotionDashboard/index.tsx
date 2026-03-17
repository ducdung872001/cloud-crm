import React, { useMemo, useState } from "react";
import Highcharts, { Options, TooltipFormatterContextObject } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

// ================================================================
// 🔷 TYPE DEFINITIONS
// ================================================================

interface DailyData {
  date: string;
  revenue: number;
  transactions: number;
  newCustomers: number;
  conversionRate: number;
  adSpend: number;
}

interface KpiConfig {
  icon: string;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
}

// ================================================================
// 🔷 SAMPLE DATA — 30 ngày khuyến mãi (01/03 – 30/03/2025)
// ================================================================

const RAW_DATA: DailyData[] = [
  { date: "01/03", revenue: 12400, transactions: 142, newCustomers: 38, conversionRate: 2.1, adSpend: 1800 },
  { date: "02/03", revenue: 13100, transactions: 158, newCustomers: 41, conversionRate: 2.3, adSpend: 1800 },
  { date: "03/03", revenue: 15800, transactions: 183, newCustomers: 52, conversionRate: 2.7, adSpend: 2000 },
  { date: "04/03", revenue: 14200, transactions: 169, newCustomers: 44, conversionRate: 2.5, adSpend: 2000 },
  { date: "05/03", revenue: 16900, transactions: 201, newCustomers: 61, conversionRate: 3.1, adSpend: 2200 },
  { date: "06/03", revenue: 18500, transactions: 224, newCustomers: 68, conversionRate: 3.4, adSpend: 2200 },
  { date: "07/03", revenue: 21200, transactions: 258, newCustomers: 79, conversionRate: 3.8, adSpend: 2500 },
  { date: "08/03", revenue: 19800, transactions: 241, newCustomers: 72, conversionRate: 3.6, adSpend: 2500 },
  { date: "09/03", revenue: 17600, transactions: 212, newCustomers: 58, conversionRate: 3.2, adSpend: 2200 },
  { date: "10/03", revenue: 22300, transactions: 271, newCustomers: 85, conversionRate: 4.0, adSpend: 2800 },
  { date: "11/03", revenue: 24800, transactions: 298, newCustomers: 94, conversionRate: 4.3, adSpend: 2800 },
  { date: "12/03", revenue: 27100, transactions: 325, newCustomers: 102, conversionRate: 4.7, adSpend: 3000 },
  { date: "13/03", revenue: 29400, transactions: 351, newCustomers: 115, conversionRate: 5.0, adSpend: 3000 },
  { date: "14/03", revenue: 32000, transactions: 382, newCustomers: 128, conversionRate: 5.4, adSpend: 3200 },
  { date: "15/03", revenue: 35500, transactions: 421, newCustomers: 141, conversionRate: 5.9, adSpend: 3500 }, // 🔥 Peak
  { date: "16/03", revenue: 38200, transactions: 458, newCustomers: 156, conversionRate: 6.3, adSpend: 3500 }, // 🔥 Peak
  { date: "17/03", revenue: 41000, transactions: 491, newCustomers: 168, conversionRate: 6.8, adSpend: 3800 }, // 🔥 Peak
  { date: "18/03", revenue: 39500, transactions: 472, newCustomers: 161, conversionRate: 6.5, adSpend: 3800 },
  { date: "19/03", revenue: 36800, transactions: 441, newCustomers: 148, conversionRate: 6.1, adSpend: 3500 },
  { date: "20/03", revenue: 34100, transactions: 409, newCustomers: 132, conversionRate: 5.7, adSpend: 3200 },
  { date: "21/03", revenue: 31500, transactions: 378, newCustomers: 119, conversionRate: 5.3, adSpend: 3000 },
  { date: "22/03", revenue: 28900, transactions: 347, newCustomers: 108, conversionRate: 4.9, adSpend: 2800 },
  { date: "23/03", revenue: 26200, transactions: 315, newCustomers: 96, conversionRate: 4.5, adSpend: 2600 },
  { date: "24/03", revenue: 23800, transactions: 286, newCustomers: 87, conversionRate: 4.1, adSpend: 2400 },
  { date: "25/03", revenue: 21400, transactions: 258, newCustomers: 76, conversionRate: 3.7, adSpend: 2200 },
  { date: "26/03", revenue: 19100, transactions: 231, newCustomers: 65, conversionRate: 3.3, adSpend: 2000 },
  { date: "27/03", revenue: 17500, transactions: 211, newCustomers: 55, conversionRate: 3.0, adSpend: 1800 },
  { date: "28/03", revenue: 15800, transactions: 191, newCustomers: 47, conversionRate: 2.7, adSpend: 1800 },
  { date: "29/03", revenue: 14200, transactions: 172, newCustomers: 40, conversionRate: 2.4, adSpend: 1600 },
  { date: "30/03", revenue: 13100, transactions: 158, newCustomers: 35, conversionRate: 2.2, adSpend: 1600 },
];

const BASELINE_DAILY_REVENUE = 11000; // Doanh thu trung bình/ngày trước KM
const BASELINE_DAILY_CUSTOMERS = 30;
const BASELINE_CONVERSION_RATE = 1.8;
const BASELINE_TRANSACTIONS = 130;

// ================================================================
// 🔷 COMPUTED METRICS
// ================================================================

const totalRevenue = RAW_DATA.reduce((s, d) => s + d.revenue, 0);
const totalAdSpend = RAW_DATA.reduce((s, d) => s + d.adSpend, 0);
const totalTransactions = RAW_DATA.reduce((s, d) => s + d.transactions, 0);
const totalNewCustomers = RAW_DATA.reduce((s, d) => s + d.newCustomers, 0);
const avgConversion = parseFloat((RAW_DATA.reduce((s, d) => s + d.conversionRate, 0) / RAW_DATA.length).toFixed(1));
const baselineRevenue = BASELINE_DAILY_REVENUE * 30;
const revenueGrowth = parseFloat((((totalRevenue - baselineRevenue) / baselineRevenue) * 100).toFixed(1));
const roi = parseFloat((((totalRevenue - totalAdSpend - baselineRevenue) / totalAdSpend) * 100).toFixed(1));
const peakDay = RAW_DATA.reduce((a, b) => (a.revenue > b.revenue ? a : b));
const avgOrderValue = Math.round(totalRevenue / totalTransactions);

const DATES = RAW_DATA.map((d) => d.date);

// ================================================================
// 🔷 CHART BUILDERS
// ================================================================

/** Chart 1 — Revenue + AdSpend (Area + Column) */
const revenueChartOptions = (): Options => ({
  chart: {
    type: "area",
    backgroundColor: "#fff",
    height: 320,
    style: { fontFamily: "'Segoe UI', Arial, sans-serif" },
  },
  title: { text: "📈 Doanh Thu & Chi Phí Quảng Cáo Theo Ngày", style: { fontSize: "15px", fontWeight: "bold", color: "#1a1a2e" } },
  xAxis: {
    categories: DATES,
    labels: { style: { fontSize: "10px", color: "#666" }, step: 4 },
    lineColor: "#ddd",
    tickColor: "#ddd",
    plotBands: [
      {
        from: 14,
        to: 16,
        color: "rgba(249,115,22,0.08)",
        label: { text: "🔥 Peak", style: { color: "#f97316", fontWeight: "bold", fontSize: "11px" } },
      },
    ],
  },
  yAxis: [
    {
      title: { text: "Doanh Thu (USD)", style: { color: "#333" } },
      labels: {
        formatter(): string {
          return `$${((this.value as number) / 1000).toFixed(0)}K`;
        },
        style: { color: "#555" },
      },
      gridLineColor: "#f0f0f0",
    },
    {
      title: { text: "Chi Phí QC (USD)", style: { color: "#f97316" } },
      labels: {
        formatter(): string {
          return `$${((this.value as number) / 1000).toFixed(1)}K`;
        },
        style: { color: "#f97316" },
      },
      opposite: true,
      gridLineWidth: 0,
    },
  ],
  tooltip: {
    shared: true,
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    borderWidth: 0,
    style: { color: "#fff", fontSize: "12px" },
    formatter(this: TooltipFormatterContextObject): string {
      const i = DATES.indexOf(this.x as string);
      const d = RAW_DATA[i];
      const dailyROI = (((d.revenue - d.adSpend) / d.adSpend) * 100).toFixed(0);
      return `<b>📅 ${this.x}/2025</b><br/>
        💰 Doanh thu: <b>$${d.revenue.toLocaleString()}</b><br/>
        📢 Chi phí QC: <b>$${d.adSpend.toLocaleString()}</b><br/>
        📊 ROI ngày: <b style="color:#fbbf24">${dailyROI}%</b>`;
    },
  },
  legend: { enabled: true, itemStyle: { fontSize: "12px" } },
  plotOptions: {
    area: { fillOpacity: 0.15, lineWidth: 2.5, marker: { enabled: false, enabledThreshold: 2, radius: 3 } },
    column: { borderRadius: 3, pointPadding: 0.1 },
  },
  series: [
    {
      type: "area",
      name: "💰 Doanh Thu",
      data: RAW_DATA.map((d) => d.revenue),
      color: "#6366f1",
      yAxis: 0,
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, "rgba(99,102,241,0.3)"],
          [1, "rgba(99,102,241,0.02)"],
        ],
      },
    },
    {
      type: "column",
      name: "📢 Chi Phí QC",
      data: RAW_DATA.map((d) => d.adSpend),
      color: "#f97316",
      yAxis: 1,
      opacity: 0.75,
    },
  ],
  credits: { enabled: false },
});

/** Chart 2 — Transactions + New Customers */
const transactionChartOptions = (): Options => ({
  chart: {
    type: "area",
    backgroundColor: "#fff",
    height: 300,
    style: { fontFamily: "'Segoe UI', Arial, sans-serif" },
  },
  title: { text: "🛒 Giao Dịch & Khách Hàng Mới Theo Ngày", style: { fontSize: "15px", fontWeight: "bold", color: "#1a1a2e" } },
  xAxis: {
    categories: DATES,
    labels: { style: { fontSize: "10px", color: "#666" }, step: 4 },
    lineColor: "#ddd",
    tickColor: "#ddd",
  },
  yAxis: [
    {
      title: { text: "Số Giao Dịch", style: { color: "#333" } },
      labels: { style: { color: "#555" } },
      gridLineColor: "#f0f0f0",
    },
    {
      title: { text: "Khách Hàng Mới", style: { color: "#34d399" } },
      labels: { style: { color: "#34d399" } },
      opposite: true,
      gridLineWidth: 0,
    },
  ],
  tooltip: {
    shared: true,
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    borderWidth: 0,
    style: { color: "#fff", fontSize: "12px" },
    formatter(this: TooltipFormatterContextObject): string {
      const i = DATES.indexOf(this.x as string);
      const d = RAW_DATA[i];
      const txGrowth = (((d.transactions - BASELINE_TRANSACTIONS) / BASELINE_TRANSACTIONS) * 100).toFixed(0);
      return `<b>📅 ${this.x}/2025</b><br/>
        🛒 Giao dịch: <b>${d.transactions.toLocaleString()}</b> <span style="color:#fbbf24">(+${txGrowth}% vs baseline)</span><br/>
        👤 Khách mới: <b>${d.newCustomers}</b><br/>
        🎯 Tỉ lệ chuyển đổi: <b style="color:#f97316">${d.conversionRate}%</b>`;
    },
  },
  legend: { enabled: true, itemStyle: { fontSize: "12px" } },
  plotOptions: {
    area: { fillOpacity: 0.12, lineWidth: 2.5, marker: { enabled: false, enabledThreshold: 2, radius: 3 } },
  },
  series: [
    {
      type: "area",
      name: "🛒 Số Giao Dịch",
      data: RAW_DATA.map((d) => d.transactions),
      color: "#60a5fa",
      yAxis: 0,
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, "rgba(96,165,250,0.3)"],
          [1, "rgba(96,165,250,0.02)"],
        ],
      },
    },
    {
      type: "area",
      name: "👤 Khách Hàng Mới",
      data: RAW_DATA.map((d) => d.newCustomers),
      color: "#34d399",
      yAxis: 1,
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, "rgba(52,211,153,0.3)"],
          [1, "rgba(52,211,153,0.02)"],
        ],
      },
    },
  ],
  credits: { enabled: false },
});

/** Chart 3 — Conversion Rate spline */
const conversionChartOptions = (): Options => ({
  chart: {
    type: "spline",
    backgroundColor: "#fff",
    height: 260,
    style: { fontFamily: "'Segoe UI', Arial, sans-serif" },
  },
  title: { text: "🎯 Tỉ Lệ Chuyển Đổi (%) Theo Ngày", style: { fontSize: "15px", fontWeight: "bold", color: "#1a1a2e" } },
  xAxis: {
    categories: DATES,
    labels: { style: { fontSize: "10px", color: "#666" }, step: 4 },
    lineColor: "#ddd",
    tickColor: "#ddd",
    plotLines: [
      {
        value: 0,
        color: "transparent",
      },
    ],
  },
  yAxis: {
    title: { text: "Tỉ Lệ Chuyển Đổi (%)", style: { color: "#333" } },
    labels: {
      formatter(): string {
        return `${this.value}%`;
      },
      style: { color: "#555" },
    },
    gridLineColor: "#f0f0f0",
    plotLines: [
      {
        value: BASELINE_CONVERSION_RATE,
        color: "#ef4444",
        dashStyle: "ShortDash",
        width: 2,
        label: { text: `Baseline ${BASELINE_CONVERSION_RATE}%`, style: { color: "#ef4444", fontSize: "10px" } },
      },
    ],
  },
  tooltip: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    borderWidth: 0,
    style: { color: "#fff", fontSize: "12px" },
    formatter(this: TooltipFormatterContextObject): string {
      const uplift = ((this.y as number) - BASELINE_CONVERSION_RATE).toFixed(1);
      return `<b>📅 ${this.x}/2025</b><br/>
        🎯 Conversion: <b>${this.y}%</b><br/>
        📈 Tăng vs baseline: <b style="color:#34d399">+${uplift}%</b>`;
    },
  },
  legend: { enabled: false },
  plotOptions: {
    spline: {
      lineWidth: 3,
      marker: { enabled: false, enabledThreshold: 2, radius: 4 },
      zones: [{ value: 3.5, color: "#60a5fa" }, { value: 5.5, color: "#f59e0b" }, { color: "#ef4444" }],
    },
  },
  series: [
    {
      type: "spline",
      name: "Conversion Rate",
      data: RAW_DATA.map((d) => d.conversionRate),
      color: "#f59e0b",
    },
  ],
  credits: { enabled: false },
});

// ================================================================
// 🔷 KPI CARD
// ================================================================

interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, sub, color, bg, trend, trendValue }) => {
  const trendColor = trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "#6b7280";
  const trendIcon = trend === "up" ? "▲" : trend === "down" ? "▼" : "—";
  return (
    <div
      style={{
        flex: "1 1 160px",
        background: bg,
        borderRadius: "14px",
        padding: "18px 16px",
        borderTop: `4px solid ${color}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        minWidth: "140px",
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </div>
      <div style={{ fontSize: "22px", fontWeight: "800", color, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: "11px", color: trendColor, marginTop: "6px", fontWeight: 600 }}>
        {trendIcon} {trendValue}
      </div>
      <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>{sub}</div>
    </div>
  );
};

// ================================================================
// 🔷 SECTION HEADER
// ================================================================

const SectionHeader: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div style={{ marginBottom: "12px" }}>
    <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#1a1a2e" }}>{title}</h2>
    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#888" }}>{desc}</p>
  </div>
);

// ================================================================
// 🔷 MAIN DASHBOARD
// ================================================================

const PromotionDashboard = (props: any) => {
  const { onBackProps } = props;
  const [activeTab, setActiveTab] = useState<"overview" | "detail">("overview");

  const kpis: KpiCardProps[] = useMemo(
    () => [
      {
        icon: "💰",
        label: "Tổng Doanh Thu",
        color: "#6366f1",
        bg: "#eef2ff",
        value: `$${(totalRevenue / 1000).toFixed(0)}K`,
        trendValue: `+${revenueGrowth}% vs baseline`,
        trend: "up",
        sub: `Baseline: $${(baselineRevenue / 1000).toFixed(0)}K`,
      },
      {
        icon: "📊",
        label: "ROI Chiến Dịch",
        color: "#f59e0b",
        bg: "#fffbeb",
        value: `${roi}%`,
        trendValue: roi > 100 ? "Rất tốt 🏆" : roi > 50 ? "Tốt ✅" : "Cần cải thiện ⚠️",
        trend: roi > 0 ? "up" : "down",
        sub: `Ad Spend: $${(totalAdSpend / 1000).toFixed(1)}K`,
      },
      {
        icon: "🛒",
        label: "Tổng Giao Dịch",
        color: "#60a5fa",
        bg: "#eff6ff",
        value: totalTransactions.toLocaleString(),
        trendValue: `+${(((totalTransactions / 30 - BASELINE_TRANSACTIONS) / BASELINE_TRANSACTIONS) * 100).toFixed(0)}% avg/ngày`,
        trend: "up",
        sub: `Peak: ${peakDay.transactions} giao dịch (${peakDay.date})`,
      },
      {
        icon: "👤",
        label: "Khách Hàng Mới",
        color: "#34d399",
        bg: "#f0fdf4",
        value: totalNewCustomers.toLocaleString(),
        trendValue: `+${(((totalNewCustomers / 30 - BASELINE_DAILY_CUSTOMERS) / BASELINE_DAILY_CUSTOMERS) * 100).toFixed(0)}% avg/ngày`,
        trend: "up",
        sub: `Avg: ${Math.round(totalNewCustomers / 30)} khách/ngày`,
      },
      {
        icon: "🎯",
        label: "Tỉ Lệ Chuyển Đổi",
        color: "#f97316",
        bg: "#fff7ed",
        value: `${avgConversion}%`,
        trendValue: `+${(avgConversion - BASELINE_CONVERSION_RATE).toFixed(1)}% vs baseline`,
        trend: "up",
        sub: `Baseline: ${BASELINE_CONVERSION_RATE}%`,
      },
      {
        icon: "🧾",
        label: "Giá Trị ĐH Trung Bình",
        color: "#a855f7",
        bg: "#faf5ff",
        value: `$${avgOrderValue}`,
        trendValue: "Avg order value",
        trend: "neutral",
        sub: `Tổng: $${(totalRevenue / 1000).toFixed(0)}K / ${totalTransactions.toLocaleString()} đơn`,
      },
    ],
    []
  );

  return (
    <div>
      <HeaderTabMenu
        title="Báo cáo khuyến mãi"
        titleBack="Khuyến mãi"
        // titleActions={titleActions}
        onBackProps={onBackProps}
      />
      <div style={{ background: "#f1f5f9", minHeight: "100vh", padding: "24px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        {/* ── HEADER ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
            borderRadius: "16px",
            padding: "24px 28px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "#fff" }}>🎯 Báo cáo chiến dịch khuyến mãi</h1>
            <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#94a3b8" }}>
              Chiến dịch: <b style={{ color: "#fbbf24" }}>Chương trình khuyến mãi Tết Bính Ngọ 2026</b> &nbsp;|&nbsp; 📅 01/03/2026 – 30/03/2026
              &nbsp;|&nbsp; 30 ngày
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["overview", "detail"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  background: activeTab === tab ? "#6366f1" : "rgba(255,255,255,0.1)",
                  color: activeTab === tab ? "#fff" : "#94a3b8",
                  transition: "all 0.2s",
                }}
              >
                {tab === "overview" ? "📊 Tổng quan" : "📋 Chi tiết"}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI CARDS ── */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "24px" }}>
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {/* ── CHART 1: Revenue ── */}
            <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <HighchartsReact highcharts={Highcharts} options={revenueChartOptions()} />
            </div>

            {/* ── CHART 2 + 3: 2 cột ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <HighchartsReact highcharts={Highcharts} options={transactionChartOptions()} />
              </div>
              <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <HighchartsReact highcharts={Highcharts} options={conversionChartOptions()} />
              </div>
            </div>

            {/* ── SUMMARY INSIGHT ── */}
            <div
              style={{
                background: "linear-gradient(135deg, #1a1a2e, #0f3460)",
                borderRadius: "14px",
                padding: "20px 24px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                { label: "🔥 Ngày doanh thu cao nhất", value: `${peakDay.date} — $${peakDay.revenue.toLocaleString()}` },
                { label: "📈 Tăng trưởng doanh thu", value: `+${revenueGrowth}% so với baseline` },
                { label: "💸 Tổng chi phí quảng cáo", value: `$${totalAdSpend.toLocaleString()}` },
                { label: "🏆 ROI chiến dịch", value: `${roi}%` },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>{item.label}</div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#fbbf24" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "detail" && (
          <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <SectionHeader title="📋 Chi Tiết Theo Ngày" desc="Toàn bộ dữ liệu 30 ngày chiến dịch Spring Sale 2025" />
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#1a1a2e", color: "#fff" }}>
                    {["Ngày", "💰 Doanh Thu", "📢 Chi Phí QC", "📊 ROI", "🛒 Giao Dịch", "🔼 Tăng TX", "👤 KH Mới", "🎯 Conv. Rate"].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "center", fontSize: "12px", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RAW_DATA.map((row, i) => {
                    const dailyROI = (((row.revenue - row.adSpend) / row.adSpend) * 100).toFixed(0);
                    const txGrowth = (((row.transactions - BASELINE_TRANSACTIONS) / BASELINE_TRANSACTIONS) * 100).toFixed(0);
                    const isPeak = row.revenue === peakDay.revenue;
                    const roiNum = parseFloat(dailyROI);
                    const roiColor = roiNum > 800 ? "#10b981" : roiNum > 500 ? "#6366f1" : "#f59e0b";
                    return (
                      <tr
                        key={row.date}
                        style={{
                          background: isPeak ? "#fffbeb" : i % 2 === 0 ? "#fff" : "#f8fafc",
                          fontWeight: isPeak ? "700" : "400",
                        }}
                      >
                        <td style={td}>
                          {isPeak ? "🔥 " : ""}
                          {row.date}
                        </td>
                        <td style={{ ...td, color: "#6366f1", fontWeight: 600 }}>${row.revenue.toLocaleString()}</td>
                        <td style={{ ...td, color: "#f97316" }}>${row.adSpend.toLocaleString()}</td>
                        <td style={{ ...td, color: roiColor, fontWeight: 700 }}>{dailyROI}%</td>
                        <td style={{ ...td, color: "#60a5fa" }}>{row.transactions.toLocaleString()}</td>
                        <td style={{ ...td, color: "#10b981" }}>+{txGrowth}%</td>
                        <td style={{ ...td, color: "#34d399" }}>{row.newCustomers}</td>
                        <td style={{ ...td, color: "#f97316", fontWeight: 600 }}>{row.conversionRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const td: React.CSSProperties = {
  padding: "9px 12px",
  textAlign: "center",
  borderBottom: "1px solid #f1f5f9",
};

export default PromotionDashboard;
