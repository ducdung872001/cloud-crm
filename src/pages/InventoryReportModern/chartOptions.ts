import Highcharts from "highcharts";
import { HEALTH_DATA, MOVEMENT_DATA } from "./mockData";

Highcharts.setOptions({
  lang: {
    thousandsSep: ".",
    decimalPoint: ",",
  },
  chart: {
    style: { fontFamily: "inherit" },
  },
});

export const createMovementOptions = (): Highcharts.Options => ({
  chart: { type: "column", height: 320, backgroundColor: "transparent" },
  title: { text: undefined },
  credits: { enabled: false },
  xAxis: { categories: MOVEMENT_DATA.map((item) => item.label), lineColor: "#e5e7eb" },
  yAxis: { title: { text: undefined }, gridLineColor: "#f3f4f6" },
  plotOptions: { column: { borderRadius: 4 } },
  series: [
    { type: "column", name: "Nhập", data: MOVEMENT_DATA.map((item) => item.importQty), color: "#3b82f6" },
    { type: "column", name: "Xuất", data: MOVEMENT_DATA.map((item) => item.exportQty), color: "#14b8a6" },
    { type: "column", name: "Điều chỉnh", data: MOVEMENT_DATA.map((item) => item.adjustmentQty), color: "#f59e0b" },
  ],
});

export const createClosingOptions = (): Highcharts.Options => ({
  chart: { type: "areaspline", height: 320, backgroundColor: "transparent" },
  title: { text: undefined },
  credits: { enabled: false },
  legend: { enabled: false },
  xAxis: { categories: MOVEMENT_DATA.map((item) => item.label), lineColor: "#e5e7eb" },
  yAxis: { title: { text: undefined }, gridLineColor: "#f3f4f6" },
  plotOptions: { areaspline: { lineWidth: 2, marker: { enabled: false }, fillOpacity: 0.18 } },
  series: [{ type: "areaspline", name: "Tồn cuối kỳ", data: MOVEMENT_DATA.map((item) => item.closingQty), color: "#7c3aed" }],
});

export const createHealthOptions = (): Highcharts.Options => ({
  chart: { type: "pie", height: 260, backgroundColor: "transparent" },
  title: { text: undefined },
  credits: { enabled: false },
  plotOptions: { pie: { innerSize: "68%", borderWidth: 0, dataLabels: { enabled: false } } },
  series: [{ type: "pie", data: HEALTH_DATA }],
});
