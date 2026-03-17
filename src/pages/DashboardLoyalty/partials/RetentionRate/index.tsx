import React from "react";
import Highcharts, { Options, TooltipFormatterContextObject } from "highcharts";
import HighchartsReact from "highcharts-react-official";

// ========================
// 🔷 Type Definitions
// ========================

interface SeriesData {
  name: string;
  data: number[];
  color: string;
  markerFillColor: string;
  markerLineColor: string;
  dashStyle?: Highcharts.DashStyleValue;
}

// ========================
// 🔷 Sample Data
// ========================

const MONTHS: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const LOYALTY_DATA: number[] = [1200, 1350, 1280, 1500, 1620, 1750, 1800, 1950, 2100, 2250, 2400, 2580];

const NON_LOYALTY_DATA: number[] = [3200, 3100, 2950, 2800, 2700, 2600, 2450, 2300, 2200, 2050, 1900, 1750];

const SERIES_CONFIG: SeriesData[] = [
  {
    name: "🏅 Thành viên Loyalty",
    data: LOYALTY_DATA,
    color: "#f4a261",
    markerFillColor: "#f4a261",
    markerLineColor: "#e76f51",
  },
  {
    name: "👤 Thành viên Non-Loyalty",
    data: NON_LOYALTY_DATA,
    color: "#4a90d9",
    markerFillColor: "#4a90d9",
    markerLineColor: "#2a6ebb",
    dashStyle: "ShortDash",
  },
];

// ========================
// 🔷 Chart Options Builder
// ========================

const buildChartOptions = (): Options => ({
  chart: {
    type: "area", // ✅ Đổi từ "line" → "area"
    backgroundColor: "#ffffff",
    style: {
      fontFamily: "'Segoe UI', Arial, sans-serif",
    },
    height: 480,
  },

  title: {
    text: "Tỷ lệ Giữ Chân Khách Hàng (Retention Rate)",
    style: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#1a1a2e",
    },
  },

  subtitle: {
    text: "So sánh Thành Viên Loyalty vs Non-Loyalty theo từng tháng năm 2025",
    style: {
      fontSize: "13px",
      color: "#666666",
    },
  },

  xAxis: {
    categories: MONTHS,
    title: {
      text: "Tháng",
      style: { color: "#333333", fontWeight: "bold" },
    },
    labels: {
      style: { color: "#555555" },
    },
    gridLineWidth: 0,
    lineColor: "#cccccc",
    tickColor: "#cccccc",
  },

  yAxis: {
    title: {
      text: "Số Thành Viên",
      style: { color: "#333333", fontWeight: "bold" },
    },
    labels: {
      formatter(): string {
        return (this.value as number).toLocaleString("vi-VN");
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
    itemStyle: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#333333",
    },
  },

  tooltip: {
    shared: true,
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    borderWidth: 0,
    style: { color: "#ffffff", fontSize: "13px" },
    formatter(this: TooltipFormatterContextObject): string {
      let s = `<b>📅 ${this.x} 2025</b><br/>`;
      if (this.points) {
        this.points.forEach((point) => {
          s += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${(point.y as number).toLocaleString(
            "vi-VN"
          )} thành viên</b><br/>`;
        });
      }
      return s;
    },
  },

  plotOptions: {
    area: {
      // ✅ Đổi từ "line" → "area"
      lineWidth: 3,
      fillOpacity: 0.15, // ✅ Thêm độ trong suốt cho vùng fill
      marker: {
        enabled: true,
        radius: 5,
        symbol: "circle",
      },
    },
  },

  series: SERIES_CONFIG.map((s) => ({
    type: "area" as const, // ✅ Đổi từ "line" → "area"
    name: s.name,
    data: s.data,
    color: s.color,
    dashStyle: s.dashStyle ?? "Solid",
    lineWidth: 3,
    fillOpacity: 0.15, // ✅ Thêm độ trong suốt cho vùng fill
    marker: {
      fillColor: s.markerFillColor,
      lineWidth: 2,
      lineColor: s.markerLineColor,
      radius: 6,
    },
  })),

  credits: {
    enabled: false,
  },

  responsive: {
    rules: [
      {
        condition: { maxWidth: 600 },
        chartOptions: {
          legend: {
            layout: "vertical",
            align: "center",
            verticalAlign: "bottom",
          },
        },
      },
    ],
  },
});

// ========================
// 🔷 Component
// ========================

const RetentionRateChart: React.FC = () => {
  const chartOptions = buildChartOptions();

  return (
    <div
      style={{
        padding: "10px",
        background: "#f9f9f9",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        marginBottom: '26px',
        marginTop: '20px'
      }}
    >
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

export default RetentionRateChart;
