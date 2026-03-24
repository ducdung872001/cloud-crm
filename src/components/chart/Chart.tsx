import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
// import Highcharts from "./chartModules";
import HighchartsReact from "highcharts-react-official";
// import HighChartWrapper from "./HighChartWrapper";
import HeatmapModule from "highcharts/modules/heatmap";
import GanttModule from "highcharts/modules/gantt";

HeatmapModule(Highcharts);
GanttModule(Highcharts);

type HighChartType =
  | "line"
  | "spline"
  | "area"
  | "areaspline"
  | "column"
  | "bar"
  | "pie"
  | "scatter"
  | "bubble"
  | "heatmap"
  | "treemap"
  | "funnel"
  | "pyramid"
  | "gauge"
  | "solidgauge"
  | "waterfall"
  | "polygon"
  | "boxplot"
  | "candlestick"
  | "ohlc"
  | "vector"
  | "errorbar"
  | "gantt";

interface HighChartProps {
  title?: string;
  chartOptions?: any;
  chartType?: HighChartType;
  allowTypeChange?: boolean;
  onTypeChange?: (type: HighChartType) => void;
}

export const plotOptionsMap: Record<NonNullable<Highcharts.Options["chart"]>["type"], Highcharts.PlotOptions> = {
  line: {
    line: {
      dataLabels: { enabled: true },
      enableMouseTracking: true,
    },
  },
  spline: {
    spline: {
      dataLabels: { enabled: false },
      marker: { enabled: true },
    },
  },
  area: {
    area: {
      fillOpacity: 0.5,
      marker: { enabled: false },
    },
  },
  areaspline: {
    areaspline: {
      fillOpacity: 0.5,
      marker: { enabled: false },
    },
  },
  column: {
    column: {
      borderWidth: 0,
      dataLabels: { enabled: true, format: "{point.y}" },
      // colorByPoint: true,
    },
    series: {
      borderWidth: 0.3,
      dataLabels: {
        enabled: true,
        format: "{point.y:.1f}%",
        style: {
          fontWeight: "bold",
        },
      },
    },
  },
  bar: {
    bar: {
      borderWidth: 0,
      dataLabels: { enabled: true, format: "{point.y}" },
      colorByPoint: true,
    },
  },
  pie: {
    pie: {
      allowPointSelect: true,
      borderWidth: 2,
      cursor: "pointer",
      dataLabels: {
        enabled: true,
        distance: 20,
        format: "{point.name}",
      },
    },
  },
  scatter: {
    scatter: {
      marker: {
        radius: 2.5,
        symbol: "circle",
        states: {
          hover: {
            enabled: true,
            lineColor: "rgb(100,100,100)",
          },
        },
      },
      states: {
        hover: {
          marker: {
            enabled: false,
          },
        },
      },
      jitter: {
        x: 0.005,
      },
      tooltip: { headerFormat: "", pointFormat: "{point.x}, {point.y}" },
    },
  },
  bubble: {
    bubble: {
      minSize: 10,
      maxSize: 60,
    },
    series: {
      dataLabels: {
        enabled: true,
        format: "{point.name}",
      },
    },
  },
  heatmap: {
    heatmap: {
      dataLabels: { enabled: true, color: "#000" },
    },
  },
  treemap: {
    treemap: {
      layoutAlgorithm: "squarified",
    },
  },
  funnel: {
    funnel: {
      neckWidth: "30%",
      neckHeight: "25%",
      dataLabels: { enabled: true, format: "<b>{point.name}</b>: {point.y}" },
    },
  },
  pyramid: {
    pyramid: {
      dataLabels: { enabled: true, format: "<b>{point.name}</b>: {point.y}" },
    },
  },
  gauge: {
    gauge: {
      dial: { backgroundColor: "black", baseWidth: 4 },
      pivot: { backgroundColor: "red" },
    },
  },
  solidgauge: {
    solidgauge: {
      dataLabels: { y: 5, borderWidth: 0, useHTML: true },
    },
  },
  waterfall: {
    waterfall: {
      upColor: "green",
      color: "red",
      dataLabels: { enabled: true },
      colorByPoint: true,
    },
  },
  polygon: {
    polygon: {
      marker: { radius: 3 },
      enableMouseTracking: true,
    },
  },
  boxplot: {
    boxplot: {
      fillColor: "#F0F0E0",
      lineWidth: 2,
      medianColor: "#0C5DA5",
      medianWidth: 2,
    },
  },
  candlestick: {
    candlestick: {
      color: "red",
    },
  },
  ohlc: {
    ohlc: {
      color: "red",
    },
  },
  vector: {
    vector: {
      color: "blue",
      vectorLength: 20,
    },
  },
  errorbar: {
    errorbar: {
      stemWidth: 1,
      whiskerLength: "50%",
    },
  },
  gantt: {
    gantt: {
      dataLabels: {
        enabled: true,
        format: "{point.name}",
      },
      tooltip: {
        pointFormat:
          "<span>Quy trình: {point.name}</span><br><span>Bắt đầu: {point.start:%e %b %Y}</span><br><span>Kết thúc: {point.end:%e %b %Y}</span>",
      },
    },
  },
};

const defaultChartOptions: Highcharts.Options = {
  title: { text: "" },
  credits: { enabled: false },
  accessibility: { announceNewData: { enabled: true } },
  xAxis: { type: "category" },
  yAxis: [{ title: { text: "" } }],
  legend: { enabled: false },
  responsive: {},
  tooltip: {
    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b>',
  },
};

const defaultTypeChartOptions = ["column", "bar", "pie", "line", "area", "spline", "areaspline", "scatter", "heatmap", "gantt"];

export const Chart = ({ chartType = "bar", chartOptions }: HighChartProps) => {
  const chartRef = useRef<any>(null);

  const chartOpts: Highcharts.Options = {
    ...defaultChartOptions,
    ...chartOptions,
    chart: { ...chartOptions?.chart, type: chartType },
    plotOptions: chartOptions?.plotOptions ?? plotOptionsMap[chartType],
    series: chartOptions?.series ?? [
      {
        name: "",
        type: chartType,
        data: [],
      },
    ],
  };

  const typeOptions = defaultTypeChartOptions?.map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  }));

  return <HighchartsReact ref={chartRef} highcharts={Highcharts} allowChartUpdate={true} options={chartOpts} />;
};
