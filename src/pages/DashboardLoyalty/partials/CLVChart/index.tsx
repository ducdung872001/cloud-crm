import React from "react";
import Highcharts, { Options, TooltipFormatterContextObject } from "highcharts";
import HighchartsReact from "highcharts-react-official";

// ========================
// 🔷 Type Definitions
// ========================

interface CLVSegment {
  segment: string;
  memberCount: number; // ✅ Thêm số lượng thành viên trong phân khúc
  acquisitionCost: number; // Avg chi phí thu hút / 1 khách (USD)
  avgRevenue: number; // Avg doanh thu vòng đời / 1 khách (USD)
  profit: number; // Avg lợi nhuận ròng / 1 khách (USD)
  clvTotal: number; // = avgRevenue + profit - acquisitionCost
}

const CLV_DATA: CLVSegment[] = [
  { segment: "New", memberCount: 1200, acquisitionCost: 120, avgRevenue: 350, profit: 80, clvTotal: 310 },
  { segment: "Returning", memberCount: 850, acquisitionCost: 80, avgRevenue: 620, profit: 210, clvTotal: 750 },
  { segment: "Loyal", memberCount: 500, acquisitionCost: 60, avgRevenue: 1100, profit: 520, clvTotal: 1560 },
  { segment: "VIP", memberCount: 120, acquisitionCost: 40, avgRevenue: 2200, profit: 1150, clvTotal: 3310 },
  { segment: "Churned", memberCount: 430, acquisitionCost: 200, avgRevenue: 180, profit: -60, clvTotal: -80 },
];

const SEGMENTS = CLV_DATA.map((d) => d.segment);
const ACQ_COST = CLV_DATA.map((d) => d.acquisitionCost);
const AVG_REV = CLV_DATA.map((d) => d.avgRevenue);
const PROFIT = CLV_DATA.map((d) => d.profit);
const CLV_TOTALS = CLV_DATA.map((d) => d.clvTotal);

// ========================
// 🔷 Chart Options Builder
// ========================

const buildChartOptions = (): Options => ({
  chart: {
    type: "column",
    backgroundColor: "#ffffff",
    style: { fontFamily: "'Segoe UI', Arial, sans-serif" },
    height: 500,
  },

  title: {
    text: "Giá Trị Vòng Đời Khách Hàng (CLV)",
    style: { fontSize: "20px", fontWeight: "bold", color: "#1a1a2e" },
  },

  subtitle: {
    text: "Phân tích CLV theo từng phân khúc khách hàng — cấu trúc chi phí, doanh thu & lợi nhuận",
    style: { fontSize: "13px", color: "#666666" },
  },

  xAxis: {
    categories: SEGMENTS,
    title: {
      text: "Phân Khúc Khách Hàng",
      style: { color: "#333333", fontWeight: "bold" },
    },
    labels: { style: { color: "#555555", fontSize: "13px" } },
    lineColor: "#cccccc",
    tickColor: "#cccccc",
  },

  yAxis: [
    // 🔵 Trục trái — giá trị USD
    {
      title: {
        text: "Giá Trị (USD)",
        style: { color: "#333333", fontWeight: "bold" },
      },
      labels: {
        formatter(): string {
          return `$${(this.value as number).toLocaleString("en-US")}`;
        },
        style: { color: "#555555" },
      },
      gridLineColor: "#e8e8e8",
      gridLineDashStyle: "ShortDash",
      stackLabels: {
        enabled: true,
        formatter(): string {
          return `$${(this.total as number).toLocaleString("en-US")}`;
        },
        style: {
          fontWeight: "bold",
          color: "#1a1a2e",
          fontSize: "11px",
          textOutline: "none",
        },
      },
    },
  ],

  legend: {
    enabled: true,
    layout: "horizontal",
    align: "center",
    verticalAlign: "bottom",
    itemStyle: { fontSize: "12px", fontWeight: "600", color: "#333333" },
  },

  tooltip: {
    shared: true,
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    borderWidth: 0,
    style: { color: "#ffffff", fontSize: "12px" },
    formatter(this: TooltipFormatterContextObject): string {
      const segment = this.x as string;
      let s = `<b>📊 Phân khúc: ${segment}</b><br/><br/>`;
      if (this.points) {
        this.points.forEach((point) => {
          const val = (point.y as number).toLocaleString("en-US");
          s += `<span style="color:${point.color}">■</span> ${point.series.name}: <b>$${val}</b><br/>`;
        });
      }
      const total = CLV_DATA.find((d) => d.segment === segment)?.clvTotal ?? 0;
      s += `<br/><b>💰 Tổng CLV: $${total.toLocaleString("en-US")}</b>`;
      return s;
    },
  },

  plotOptions: {
    column: {
      stacking: "normal", // ✅ Cột chồng (stacked)
      borderRadius: 4,
      pointPadding: 0.1,
      groupPadding: 0.15,
      dataLabels: { enabled: false },
    },
    spline: {
      lineWidth: 3,
      marker: {
        enabled: true,
        radius: 6,
        symbol: "diamond",
        fillColor: "#ffffff",
        lineWidth: 2,
        lineColor: "#ff6b6b",
      },
      dataLabels: {
        enabled: true,
        formatter(): string {
          return `$${(this.y as number).toLocaleString("en-US")}`;
        },
        style: {
          fontSize: "10px",
          color: "#ff6b6b",
          fontWeight: "bold",
          textOutline: "none",
        },
        y: -10,
      },
    },
  },

  series: [
    // 📊 Stacked Columns — 3 thành phần CLV
    {
      type: "column",
      name: "💸 Chi phí thu hút (Acquisition Cost)",
      data: ACQ_COST,
      color: "#ef4444",
      stack: "clv",
    },
    {
      type: "column",
      name: "📈 Doanh thu trung bình (Avg Revenue)",
      data: AVG_REV,
      color: "#60a5fa",
      stack: "clv",
    },
    {
      type: "column",
      name: "💰 Lợi nhuận (Profit)",
      data: PROFIT,
      color: "#34d399",
      stack: "clv",
    },
    // 📉 Spline overlay — tổng CLV trend
    {
      type: "spline",
      name: "🔺 Tổng CLV",
      data: CLV_TOTALS,
      color: "#ff6b6b",
      lineWidth: 3,
      zIndex: 5,
      yAxis: 0,
    },
  ],

  credits: { enabled: false },

  responsive: {
    rules: [
      {
        condition: { maxWidth: 600 },
        chartOptions: {
          legend: { layout: "vertical", align: "center", verticalAlign: "bottom" },
          yAxis: [{ stackLabels: { enabled: false } }],
        },
      },
    ],
  },
});

// ========================
// 🔷 Component
// ========================

const CLVChart: React.FC = () => {
  const chartOptions = buildChartOptions();

  return (
    <div
      style={{
        padding: "10px",
        background: "#f9f9f9",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        marginBottom: "26px"
      }}
    >
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />

      {/* 📋 Bảng tóm tắt dữ liệu */}
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
            <th style={thStyle}>Phân khúc</th>
            <th style={thStyle}>👥 Số thành viên</th>
            <th style={thStyle}>💸 Acq. Cost</th>
            <th style={thStyle}>📈 Avg Revenue</th>
            <th style={thStyle}>💰 Profit</th>
            <th style={{ ...thStyle, color: "#fbbf24" }}>🏆 CLV / khách</th>
            <th style={{ ...thStyle, color: "#34d399" }}>📊 Tổng giá trị phân khúc</th>
          </tr>
        </thead>
        <tbody>
          {CLV_DATA.map((row, i) => {
            const segmentTotal = row.memberCount * row.clvTotal;
            return (
              <tr key={row.segment} style={{ background: i % 2 === 0 ? "#ffffff" : "#f3f4f6" }}>
                <td style={tdStyle}>
                  <b>{row.segment}</b>
                </td>
                <td style={{ ...tdStyle, color: "#6366f1" }}>{row.memberCount.toLocaleString("en-US")}</td>
                <td style={{ ...tdStyle, color: "#ef4444" }}>${row.acquisitionCost.toLocaleString("en-US")}</td>
                <td style={{ ...tdStyle, color: "#3b82f6" }}>${row.avgRevenue.toLocaleString("en-US")}</td>
                <td style={{ ...tdStyle, color: row.profit < 0 ? "#ef4444" : "#10b981" }}>${row.profit.toLocaleString("en-US")}</td>
                <td style={{ ...tdStyle, fontWeight: "bold", color: row.clvTotal < 0 ? "#ef4444" : "#1a1a2e" }}>
                  ${row.clvTotal.toLocaleString("en-US")}
                </td>
                <td style={{ ...tdStyle, fontWeight: "bold", color: segmentTotal < 0 ? "#ef4444" : "#059669" }}>
                  ${segmentTotal.toLocaleString("en-US")}
                </td>
              </tr>
            );
          })}

          {/* 🔢 Hàng tổng cộng */}
          <tr style={{ background: "#1a1a2e", color: "#fff" }}>
            <td style={{ ...tdStyle, color: "#fff", fontWeight: "bold" }}>Tổng</td>
            <td style={{ ...tdStyle, color: "#a5b4fc", fontWeight: "bold" }}>
              {CLV_DATA.reduce((sum, r) => sum + r.memberCount, 0).toLocaleString("en-US")}
            </td>
            <td style={tdStyle}>—</td>
            <td style={tdStyle}>—</td>
            <td style={tdStyle}>—</td>
            <td style={tdStyle}>—</td>
            <td style={{ ...tdStyle, color: "#34d399", fontWeight: "bold" }}>
              ${CLV_DATA.reduce((sum, r) => sum + r.memberCount * r.clvTotal, 0).toLocaleString("en-US")}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ========================
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

export default CLVChart;
