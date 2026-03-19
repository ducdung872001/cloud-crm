import Highcharts from "highcharts";
import { GROWTH_DATA, REGION_DATA, RETURN_DATA_NEW, RETURN_DATA_OLD, TIER_DATA } from "./mockData";

Highcharts.setOptions({
  lang: {
    thousandsSep: ".",
    decimalPoint: ",",
  },
  chart: {
    style: { fontFamily: "inherit" },
  },
});

export const createGrowthOptions = (): Highcharts.Options => ({
  chart: { type: "column", height: 240, backgroundColor: "transparent" },
  title: { text: undefined },
  credits: { enabled: false },
  legend: { enabled: false },
  xAxis: { categories: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"], lineColor: "#e5e7eb" },
  yAxis: { title: { text: undefined }, gridLineColor: "#f1f5f9" },
  plotOptions: { column: { borderRadius: 4 } },
  series: [{ type: "column", data: GROWTH_DATA, color: "#8b5cf6", name: "Khách mới" }],
});

export const createTierOptions = (): Highcharts.Options => ({
  chart: { type: "pie", height: 220, backgroundColor: "transparent" },
  title: { text: undefined },
  credits: { enabled: false },
  plotOptions: { pie: { innerSize: "68%", borderWidth: 0, dataLabels: { enabled: false } } },
  series: [{ type: "pie", data: TIER_DATA }],
});

export const createReturnOptions = (): Highcharts.Options => ({
  chart: { type: "areaspline", height: 280, backgroundColor: "transparent" },
  title: { text: undefined },
  credits: { enabled: false },
  xAxis: { categories: ["T10", "T11", "T12", "T01", "T02", "T03"], lineColor: "#e5e7eb" },
  yAxis: { title: { text: undefined }, gridLineColor: "#f1f5f9" },
  tooltip: { shared: true },
  plotOptions: { areaspline: { marker: { enabled: false }, lineWidth: 2, fillOpacity: 0.1 } },
  series: [
    { type: "areaspline", name: "Khách mới", data: RETURN_DATA_NEW, color: "#8b5cf6" },
    { type: "areaspline", name: "Khách quay lại", data: RETURN_DATA_OLD, color: "#2563eb" },
  ],
});

export const createRegionOptions = (): Highcharts.Options => ({
  chart: { type: "bar", height: 280, backgroundColor: "transparent" },
  title: { text: undefined },
  credits: { enabled: false },
  legend: { enabled: false },
  xAxis: { categories: REGION_DATA.map((item) => item.name) },
  yAxis: { title: { text: undefined }, gridLineColor: "#f1f5f9" },
  plotOptions: { bar: { borderRadius: 4 } },
  series: [{ type: "bar", data: REGION_DATA, name: "Tỷ trọng" }],
});
