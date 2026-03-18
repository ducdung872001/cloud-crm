import Highcharts from "highcharts";
import { CHANNEL_COLORS, LEAD_TREND } from "./mockData";
import type { ChannelReport } from "./mockData";

Highcharts.setOptions({
  lang: {
    thousandsSep: ".",
    decimalPoint: ",",
  },
  chart: {
    style: { fontFamily: "inherit" },
  },
});

export const createTrendChartOptions = (): Highcharts.Options => ({
  chart: { type: "areaspline", height: 320, backgroundColor: "transparent" },
  title: { text: undefined },
  credits: { enabled: false },
  xAxis: {
    categories: LEAD_TREND.map((item) => item.label),
    lineColor: "#e5e7eb",
  },
  yAxis: {
    title: { text: undefined },
    gridLineColor: "#f3f4f6",
  },
  tooltip: { shared: true, borderRadius: 10 },
  plotOptions: {
    areaspline: {
      marker: { enabled: false },
      lineWidth: 2,
      fillOpacity: 0.12,
    },
  },
  series: [
    {
      type: "areaspline",
      name: "Reach",
      data: LEAD_TREND.map((item) => item.reach),
      color: "#c026d3",
    },
    {
      type: "areaspline",
      name: "Lead",
      data: LEAD_TREND.map((item) => item.leads),
      color: "#2563eb",
    },
    {
      type: "areaspline",
      name: "Chuyển đổi",
      data: LEAD_TREND.map((item) => item.conversions),
      color: "#14b8a6",
    },
  ],
});

export const createChannelMixOptions = (channels: ChannelReport[]): Highcharts.Options => ({
  chart: { type: "pie", height: 260, backgroundColor: "transparent" },
  title: { text: undefined },
  credits: { enabled: false },
  tooltip: {
    pointFormat: "<b>{point.y} lead</b> ({point.percentage:.1f}%)",
  },
  plotOptions: {
    pie: {
      innerSize: "66%",
      borderWidth: 0,
      dataLabels: { enabled: false },
    },
  },
  series: [
    {
      type: "pie",
      data: channels.map((item, index) => ({
        name: item.channel,
        y: item.leads,
        color: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
      })),
    },
  ],
});

export const createChannelPerformanceOptions = (channels: ChannelReport[]): Highcharts.Options => ({
  chart: { type: "bar", height: 320, backgroundColor: "transparent" },
  title: { text: undefined },
  credits: { enabled: false },
  xAxis: {
    categories: channels.map((item) => item.channel),
  },
  yAxis: {
    title: { text: undefined },
    gridLineColor: "#f3f4f6",
  },
  tooltip: {
    shared: true,
    borderRadius: 10,
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
    },
  },
  series: [
    {
      type: "bar",
      name: "Lead",
      data: channels.map((item, index) => ({
        y: item.leads,
        color: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
      })),
    },
    {
      type: "bar",
      name: "Chuyển đổi",
      data: channels.map((item) => item.conversions),
      color: "#0f766e",
    },
  ],
});
