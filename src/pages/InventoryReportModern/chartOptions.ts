import Highcharts from "highcharts";
import { IInventoryHealth, IInventoryMovement, IInventoryTrend } from "services/InventoryReportService";
import { HEALTH_DATA, MOVEMENT_DATA } from "./mockData";

Highcharts.setOptions({
  lang: { thousandsSep: ".", decimalPoint: "," },
  chart: { style: { fontFamily: "inherit" } },
});

/**
 * Biểu đồ cột — Biến động nhập/xuất/điều chỉnh
 * Nhận data từ state (real hoặc mock), không import trực tiếp MOVEMENT_DATA
 */
export const createMovementOptions = (
  data: IInventoryMovement[] = MOVEMENT_DATA.map((d) => ({
    label: d.label, importQty: d.importQty, exportQty: d.exportQty,
    adjustmentQty: d.adjustmentQty, closingQty: d.closingQty,
  }))
): Highcharts.Options => ({
  chart: { type: "column", height: 320, backgroundColor: "transparent" },
  title: { text: undefined },
  credits: { enabled: false },
  legend: {
    enabled: true,
    align: "center",
    verticalAlign: "bottom",
    itemStyle: { fontWeight: "400", fontSize: "12px", color: "#6b7280" },
  },
  xAxis: { categories: data.map((d) => d.label), lineColor: "#e5e7eb" },
  yAxis: { title: { text: undefined }, gridLineColor: "#f3f4f6" },
  plotOptions: { column: { borderRadius: 4 } },
  series: [
    { type: "column", name: "Nhập",      data: data.map((d) => d.importQty),     color: "#3b82f6" },
    { type: "column", name: "Xuất",      data: data.map((d) => d.exportQty),     color: "#14b8a6" },
    { type: "column", name: "Điều chỉnh", data: data.map((d) => d.adjustmentQty), color: "#f59e0b" },
  ],
});

/**
 * Biểu đồ areaspline — Xu hướng tồn cuối kỳ
 */
export const createClosingOptions = (
  data: IInventoryTrend[] = MOVEMENT_DATA.map((d) => ({ label: d.label, closingQty: d.closingQty }))
): Highcharts.Options => ({
  chart: { type: "areaspline", height: 320, backgroundColor: "transparent" },
  title: { text: undefined },
  credits: { enabled: false },
  legend: { enabled: false },
  xAxis: { categories: data.map((d) => d.label), lineColor: "#e5e7eb" },
  yAxis: { title: { text: undefined }, gridLineColor: "#f3f4f6" },
  plotOptions: { areaspline: { lineWidth: 2, marker: { enabled: false }, fillOpacity: 0.18 } },
  series: [{ type: "areaspline", name: "Tồn cuối kỳ", data: data.map((d) => d.closingQty), color: "#7c3aed" }],
});

/**
 * Biểu đồ donut — Sức khỏe tồn kho
 */
export const createHealthOptions = (
  data: IInventoryHealth[] = HEALTH_DATA
): Highcharts.Options => ({
  chart: { type: "pie", height: 260, backgroundColor: "transparent" },
  title: { text: undefined },
  credits: { enabled: false },
  plotOptions: { pie: { innerSize: "68%", borderWidth: 0, dataLabels: { enabled: false } } },
  series: [{ type: "pie", data: data.map((d) => ({ name: d.name, y: d.y, color: d.color })) }],
});