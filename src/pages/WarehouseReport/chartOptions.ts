import Highcharts from "highcharts";
import {
  COST_GROUP_VALUES,
  COST_PERIOD_VALUES,
  HISTORY_STOCK_LINE,
  HISTORY_WEEKLY_FLOW,
  SLOW_DAYS_RATIO,
  SLOW_GROUP_VALUES,
  XNT_TREND_DATA,
  XNT_WAREHOUSE_RATIO,
} from "./viewChartData";

Highcharts.setOptions({
  lang: { thousandsSep: ".", decimalPoint: "," },
  chart: { style: { fontFamily: "inherit" } },
  credits: { enabled: false },
  title: { text: undefined },
});

export const createXntTrendOptions = (): Highcharts.Options => ({
  chart: { type: "column", height: 240, backgroundColor: "transparent" },
  xAxis: { categories: XNT_TREND_DATA.labels, lineColor: "#e4e2d9" },
  yAxis: { title: { text: undefined }, gridLineColor: "rgba(0,0,0,0.055)" },
  legend: { enabled: false },
  plotOptions: { column: { borderRadius: 3 } },
  series: [
    { type: "column", name: "Nhập kho", data: XNT_TREND_DATA.importQty, color: "#1d4ed8" },
    { type: "column", name: "Xuất kho", data: XNT_TREND_DATA.exportQty, color: "#f97316" },
  ],
});

export const createXntWarehouseRatioOptions = (): Highcharts.Options => ({
  chart: { type: "pie", height: 240, backgroundColor: "transparent" },
  tooltip: { pointFormat: "<b>{point.y}%</b>" },
  plotOptions: { pie: { innerSize: "62%", borderWidth: 0, dataLabels: { enabled: false } } },
  legend: { enabled: false },
  series: [{ type: "pie", data: XNT_WAREHOUSE_RATIO }],
});

export const createCostGroupOptions = (): Highcharts.Options => ({
  chart: { type: "bar", height: 240, backgroundColor: "transparent" },
  xAxis: { categories: COST_GROUP_VALUES.map((item) => item.name) },
  yAxis: { title: { text: undefined }, gridLineColor: "rgba(0,0,0,0.055)" },
  legend: { enabled: false },
  plotOptions: { bar: { borderRadius: 4 } },
  series: [{ type: "bar", data: COST_GROUP_VALUES.map((item) => ({ y: item.y, color: item.color })), name: "Giá trị" }],
});

export const createCostPeriodOptions = (): Highcharts.Options => ({
  chart: { type: "column", height: 240, backgroundColor: "transparent" },
  xAxis: { categories: COST_PERIOD_VALUES.labels, lineColor: "#e4e2d9" },
  yAxis: { title: { text: undefined }, gridLineColor: "rgba(0,0,0,0.055)" },
  legend: { enabled: false },
  plotOptions: { column: { borderRadius: 3 } },
  series: [
    { type: "column", name: "Giá trị tồn", data: COST_PERIOD_VALUES.inventoryValue, color: "#047857" },
    { type: "column", name: "Giá vốn", data: COST_PERIOD_VALUES.costValue, color: "#f59e0b" },
  ],
});

export const createSlowDaysOptions = (): Highcharts.Options => ({
  chart: { type: "pie", height: 220, backgroundColor: "transparent" },
  tooltip: { pointFormat: "<b>{point.y} sản phẩm</b>" },
  plotOptions: { pie: { innerSize: "58%", borderWidth: 0, dataLabels: { enabled: false } } },
  legend: { enabled: false },
  series: [{ type: "pie", data: SLOW_DAYS_RATIO }],
});

export const createSlowGroupOptions = (): Highcharts.Options => ({
  chart: { type: "bar", height: 240, backgroundColor: "transparent" },
  xAxis: { categories: SLOW_GROUP_VALUES.map((item) => item.name) },
  yAxis: { title: { text: undefined }, gridLineColor: "rgba(0,0,0,0.055)" },
  legend: { enabled: false },
  plotOptions: { bar: { borderRadius: 4 } },
  series: [{ type: "bar", name: "Giá trị ứ đọng", data: SLOW_GROUP_VALUES.map((item) => ({ y: item.y, color: item.color })) }],
});

export const createHistoryStockOptions = (): Highcharts.Options => ({
  chart: { type: "areaspline", height: 240, backgroundColor: "transparent" },
  xAxis: { categories: HISTORY_STOCK_LINE.labels, lineColor: "#e4e2d9" },
  yAxis: { title: { text: undefined }, gridLineColor: "rgba(0,0,0,0.055)" },
  legend: { enabled: false },
  plotOptions: { areaspline: { marker: { enabled: false }, lineWidth: 2, fillOpacity: 0.1 } },
  series: [{ type: "areaspline", name: "Tồn kho", data: HISTORY_STOCK_LINE.values, color: "#1d4ed8" }],
});

export const createHistoryFlowOptions = (): Highcharts.Options => ({
  chart: { type: "column", height: 220, backgroundColor: "transparent" },
  xAxis: { categories: HISTORY_WEEKLY_FLOW.labels, lineColor: "#e4e2d9" },
  yAxis: { title: { text: undefined }, gridLineColor: "rgba(0,0,0,0.055)" },
  legend: { enabled: false },
  plotOptions: { column: { borderRadius: 3 } },
  series: [
    { type: "column", name: "Nhập kho", data: HISTORY_WEEKLY_FLOW.importQty, color: "#1d4ed8" },
    { type: "column", name: "Xuất kho", data: HISTORY_WEEKLY_FLOW.exportQty, color: "#f97316" },
  ],
});
