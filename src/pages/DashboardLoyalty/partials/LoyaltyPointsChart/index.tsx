import React, { useMemo } from "react";
import Highcharts, { Options, TooltipFormatterContextObject } from "highcharts";
import HighchartsReact from "highcharts-react-official";

// ========================
// 🔷 Type Definitions
// ========================

interface MonthlyPointData {
  month: string;
  earned: number; // Tổng điểm tích luỹ trong tháng
  spent: number; // Tổng điểm đã tiêu trong tháng
}

interface SummaryStats {
  totalEarned: number;
  totalSpent: number;
  totalRemaining: number;
  redemptionRate: number; // % điểm đã tiêu / tích luỹ
}

// ========================
// 🔷 Sample Data — 12 tháng năm 2025
// ========================

const POINTS_DATA: MonthlyPointData[] = [
  { month: "Jan", earned: 52000, spent: 18000 },
  { month: "Feb", earned: 47500, spent: 21000 },
  { month: "Mar", earned: 61000, spent: 25500 },
  { month: "Apr", earned: 58000, spent: 29000 },
  { month: "May", earned: 73000, spent: 34000 },
  { month: "Jun", earned: 85000, spent: 41000 },
  { month: "Jul", earned: 91000, spent: 48500 },
  { month: "Aug", earned: 88000, spent: 52000 },
  { month: "Sep", earned: 79000, spent: 45000 },
  { month: "Oct", earned: 95000, spent: 61000 },
  { month: "Nov", earned: 112000, spent: 78000 },
  { month: "Dec", earned: 128000, spent: 95000 },
];

const MONTHS = POINTS_DATA.map((d) => d.month);
const EARNED_SERIES = POINTS_DATA.map((d) => d.earned);
const SPENT_SERIES = POINTS_DATA.map((d) => d.spent);

// ========================
// 🔷 Summary Stats Calculator
// ========================

const calcStats = (data: MonthlyPointData[]): SummaryStats => {
  const totalEarned = data.reduce((s, d) => s + d.earned, 0);
  const totalSpent = data.reduce((s, d) => s + d.spent, 0);
  const totalRemaining = totalEarned - totalSpent;
  const redemptionRate = parseFloat(((totalSpent / totalEarned) * 100).toFixed(1));
  return { totalEarned, totalSpent, totalRemaining, redemptionRate };
};

// ========================
// 🔷 Chart Options Builder
// ========================

const buildChartOptions = (): Options => ({
  chart: {
    type: "area",
    backgroundColor: "#ffffff",
    style: { fontFamily: "'Segoe UI', Arial, sans-serif" },
    height: 460,
  },

  title: {
    text: "Xu Hướng Tích Điểm & Sử Dụng Điểm Thưởng",
    style: { fontSize: "20px", fontWeight: "bold", color: "#1a1a2e" },
  },

  subtitle: {
    text: "Tổng điểm tích luỹ vs Tổng điểm đã tiêu của toàn bộ khách hàng — 2025",
    style: { fontSize: "13px", color: "#666666" },
  },

  xAxis: {
    categories: MONTHS,
    title: {
      text: "Tháng",
      style: { color: "#333333", fontWeight: "bold" },
    },
    labels: { style: { color: "#555555" } },
    gridLineWidth: 0,
    lineColor: "#cccccc",
    tickColor: "#cccccc",
  },

  yAxis: {
    title: {
      text: "Số Điểm Thưởng",
      style: { color: "#333333", fontWeight: "bold" },
    },
    labels: {
      formatter(): string {
        const v = this.value as number;
        return v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`;
      },
      style: { color: "#555555" },
    },
    gridLineColor: "#e8e8e8",
    gridLineDashStyle: "ShortDash",
    min: 0,
  },

  legend: {
    enabled: true,
    layout: "horizontal",
    align: "center",
    verticalAlign: "bottom",
    itemStyle: { fontSize: "13px", fontWeight: "600", color: "#333333" },
  },

  tooltip: {
    shared: true,
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    borderWidth: 0,
    style: { color: "#ffffff", fontSize: "12px" },
    formatter(this: TooltipFormatterContextObject): string {
      const idx = MONTHS.indexOf(this.x as string);
      const row = POINTS_DATA[idx];
      const remaining = row.earned - row.spent;
      const redeemRate = ((row.spent / row.earned) * 100).toFixed(1);

      let s = `<b>📅 ${this.x} 2025</b><br/><br/>`;
      s += `<span style="color:#34d399">●</span> Điểm tích luỹ: <b>${row.earned.toLocaleString("vi-VN")} pts</b><br/>`;
      s += `<span style="color:#f97316">●</span> Điểm đã tiêu: <b>${row.spent.toLocaleString("vi-VN")} pts</b><br/>`;
      s += `<br/>`;
      s += `📊 Tỉ lệ tiêu / tích luỹ: <b style="color:#fbbf24">${redeemRate}%</b><br/>`;
      s += `💚 Điểm còn lại: <b style="color:#34d399">${remaining.toLocaleString("vi-VN")} pts</b>`;
      return s;
    },
  },

  plotOptions: {
    area: {
      lineWidth: 2.5,
      marker: {
        enabled: true,
        radius: 4,
        symbol: "circle",
      },
      fillOpacity: 0.15,
    },
  },

  series: [
    {
      type: "area",
      name: "🟢 Tổng điểm tích luỹ (Earned)",
      data: EARNED_SERIES,
      color: "#34d399",
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, "rgba(52, 211, 153, 0.35)"],
          [1, "rgba(52, 211, 153, 0.02)"],
        ],
      },
      lineWidth: 3,
      marker: { fillColor: "#34d399", lineColor: "#059669", lineWidth: 2, radius: 5 },
      zIndex: 1,
    },
    {
      type: "area",
      name: "🟠 Tổng điểm đã tiêu (Spent)",
      data: SPENT_SERIES,
      color: "#f97316",
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, "rgba(249, 115, 22, 0.35)"],
          [1, "rgba(249, 115, 22, 0.02)"],
        ],
      },
      lineWidth: 3,
      marker: { fillColor: "#f97316", lineColor: "#ea580c", lineWidth: 2, radius: 5 },
      zIndex: 2,
    },
  ],

  credits: { enabled: false },

  responsive: {
    rules: [
      {
        condition: { maxWidth: 600 },
        chartOptions: {
          legend: { layout: "vertical", align: "center", verticalAlign: "bottom" },
        },
      },
    ],
  },
});

// ========================
// 🔷 KPI Card Component
// ========================

interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bg: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, sub, color, bg }) => (
  <div
    style={{
      flex: "1 1 180px",
      background: bg,
      borderRadius: "12px",
      padding: "16px 20px",
      borderLeft: `4px solid ${color}`,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}
  >
    <div style={{ fontSize: "22px", marginBottom: "6px" }}>{icon}</div>
    <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: "22px", fontWeight: "800", color }}>{value}</div>
    {sub && <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>{sub}</div>}
  </div>
);

// ========================
// 🔷 Main Component
// ========================

const LoyaltyPointsChart: React.FC = () => {
  const stats = useMemo(() => calcStats(POINTS_DATA), []);
  const chartOptions = useMemo(() => buildChartOptions(), []);

  return (
    <div
      style={{
        padding: "24px",
        background: "#f9f9f9",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      {/* 📊 KPI Summary Cards */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
        <KpiCard
          icon="🏦"
          label="Tổng điểm tích luỹ"
          value={`${stats.totalEarned.toLocaleString("vi-VN")} pts`}
          sub="Tổng cộng cả năm 2025"
          color="#059669"
          bg="#f0fdf4"
        />
        <KpiCard
          icon="🛍️"
          label="Tổng điểm đã tiêu"
          value={`${stats.totalSpent.toLocaleString("vi-VN")} pts`}
          sub="Khách hàng đã đổi thưởng"
          color="#ea580c"
          bg="#fff7ed"
        />
        <KpiCard
          icon="💎"
          label="Điểm còn lại"
          value={`${stats.totalRemaining.toLocaleString("vi-VN")} pts`}
          sub="Chưa được đổi thưởng"
          color="#6366f1"
          bg="#eef2ff"
        />
        <KpiCard
          icon="📊"
          label="Tỉ lệ tiêu / tích luỹ"
          value={`${stats.redemptionRate}%`}
          sub={
            stats.redemptionRate >= 60
              ? "✅ Tốt — khách hàng tương tác cao"
              : stats.redemptionRate >= 40
              ? "⚠️ Trung bình — cần khuyến khích đổi thưởng"
              : "❌ Thấp — điểm bị tồn đọng nhiều"
          }
          color="#f59e0b"
          bg="#fffbeb"
        />
      </div>

      {/* 📈 Chart */}
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />

      {/* 📋 Bảng chi tiết theo tháng */}
      <table
        style={{
          marginTop: "24px",
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "13px",
          color: "#333",
        }}
      >
        <thead>
          <tr style={{ background: "#1a1a2e", color: "#fff" }}>
            <th style={thStyle}>Tháng</th>
            <th style={{ ...thStyle, color: "#34d399" }}>🏦 Điểm tích luỹ</th>
            <th style={{ ...thStyle, color: "#f97316" }}>🛍️ Điểm đã tiêu</th>
            <th style={{ ...thStyle, color: "#a5b4fc" }}>💎 Điểm còn lại</th>
            <th style={{ ...thStyle, color: "#fbbf24" }}>📊 Tỉ lệ tiêu/tích luỹ</th>
          </tr>
        </thead>
        <tbody>
          {POINTS_DATA.map((row, i) => {
            const remaining = row.earned - row.spent;
            const redeemRate = ((row.spent / row.earned) * 100).toFixed(1);
            const rateNum = parseFloat(redeemRate);
            const rateColor = rateNum >= 60 ? "#059669" : rateNum >= 40 ? "#f59e0b" : "#ef4444";

            return (
              <tr key={row.month} style={{ background: i % 2 === 0 ? "#ffffff" : "#f3f4f6" }}>
                <td style={{ ...tdStyle, fontWeight: "bold" }}>{row.month} 2025</td>
                <td style={{ ...tdStyle, color: "#059669" }}>{row.earned.toLocaleString("vi-VN")}</td>
                <td style={{ ...tdStyle, color: "#ea580c" }}>{row.spent.toLocaleString("vi-VN")}</td>
                <td style={{ ...tdStyle, color: "#6366f1", fontWeight: "bold" }}>{remaining.toLocaleString("vi-VN")}</td>
                <td style={{ ...tdStyle, fontWeight: "bold", color: rateColor }}>{redeemRate}%</td>
              </tr>
            );
          })}

          {/* Hàng tổng */}
          <tr style={{ background: "#1a1a2e", color: "#fff" }}>
            <td style={{ ...tdStyle, color: "#fff", fontWeight: "bold" }}>Tổng 2025</td>
            <td style={{ ...tdStyle, color: "#34d399", fontWeight: "bold" }}>{stats.totalEarned.toLocaleString("vi-VN")}</td>
            <td style={{ ...tdStyle, color: "#f97316", fontWeight: "bold" }}>{stats.totalSpent.toLocaleString("vi-VN")}</td>
            <td style={{ ...tdStyle, color: "#a5b4fc", fontWeight: "bold" }}>{stats.totalRemaining.toLocaleString("vi-VN")}</td>
            <td style={{ ...tdStyle, color: "#fbbf24", fontWeight: "bold" }}>{stats.redemptionRate}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ========================
// 🔷 Table Styles
// 🔷 Table Styles
// ========================

const thStyle: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "center",
  fontWeight: "700",
  fontSize: "13px",
};

const tdStyle: React.CSSProperties = {
  padding: "9px 14px",
  textAlign: "center",
  borderBottom: "1px solid #e5e7eb",
};

export default LoyaltyPointsChart;
