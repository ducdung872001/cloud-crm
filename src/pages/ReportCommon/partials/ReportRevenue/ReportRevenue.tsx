import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { IReportCommonFilterRequest } from "model/report/ReportRequest";
import { IReportRevenueResponse } from "model/report/ReportResponse";
import { IReportCommonProps } from "model/report/PropsModel";
import Loading from "components/loading";
import ReportService from "services/ReportService";
import { showToast } from "utils/common";
import { SystemNotification } from "components/systemNotification/systemNotification";
import "./ReportRevenue.scss";

type RevenueSeriesKey = "revenue" | "expense" | "income" | "debt";

const USE_MOCK_REPORT_DATA = true;

const MOCK_REVENUE_DATA: IReportRevenueResponse[] = [
  { time: "2026-03-10", revenue: 36000000, expense: 21000000, income: 15000000, debt: 6200000 },
  { time: "2026-03-11", revenue: 42000000, expense: 24500000, income: 17500000, debt: 6800000 },
  { time: "2026-03-12", revenue: 48000000, expense: 28200000, income: 19800000, debt: 7100000 },
  { time: "2026-03-13", revenue: 45000000, expense: 27100000, income: 17900000, debt: 6900000 },
  { time: "2026-03-14", revenue: 53000000, expense: 30500000, income: 22500000, debt: 7300000 },
  { time: "2026-03-15", revenue: 56000000, expense: 33100000, income: 22900000, debt: 7600000 },
  { time: "2026-03-16", revenue: 62000000, expense: 35800000, income: 26200000, debt: 8100000 },
];

const SERIES_META: Record<RevenueSeriesKey, { label: string; color: string; icon: string }> = {
  revenue: { label: "Doanh thu", color: "#1d4ed8", icon: "MoneyFill" },
  expense: { label: "Chi phí", color: "#c2410c", icon: "Expense" },
  income: { label: "Lợi nhuận", color: "#047857", icon: "ReceiveMoney" },
  debt: { label: "Công nợ", color: "#b45309", icon: "Dollar" },
};

export default function ReportRevenue(props: IReportCommonProps) {
  const { params, callback } = props;

  const [listRevenue, setListRevenue] = useState<IReportRevenueResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getRevenue = async (paramsSearch: IReportCommonFilterRequest) => {
    if (USE_MOCK_REPORT_DATA) {
      setListRevenue(MOCK_REVENUE_DATA);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const response = await ReportService.revenue(paramsSearch);

    if (response.code == 0) {
      setListRevenue(response.result || []);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (params.fromTime && params.toTime) {
      getRevenue(params);
    }
  }, [params]);

  useEffect(() => {
    callback?.(listRevenue);
  }, [callback, listRevenue]);

  const totals = useMemo(
    () =>
      listRevenue.reduce(
        (acc, item) => {
          acc.revenue += item.revenue || 0;
          acc.expense += item.expense || 0;
          acc.income += item.income || 0;
          acc.debt += item.debt || 0;
          return acc;
        },
        { revenue: 0, expense: 0, income: 0, debt: 0 }
      ),
    [listRevenue]
  );

  const latestDay = useMemo(() => {
    if (!listRevenue.length) {
      return null;
    }

    return [...listRevenue].sort((a, b) => Number(b.time || b.date || 0) - Number(a.time || a.date || 0))[0];
  }, [listRevenue]);

  const categories = useMemo(
    () =>
      listRevenue.map((item) => {
        const date = item.time || item.date;
        return `${moment(date).format("DD/MM")}<br/><span style="font-size:10px;color:#9a9890">${moment(date).format("ddd")}</span>`;
      }),
    [listRevenue]
  );

  const summaryCards = useMemo(
    () =>
      [
        {
          key: "revenue",
          label: "Doanh thu thuần",
          color: "#2563eb",
          value: totals.revenue || 0,
          subValue: params.fromTime && params.toTime ? `${params.fromTime} - ${params.toTime}` : " ",
        },
        {
          key: "expense",
          label: "Chi phí",
          color: "#c2410c",
          value: totals.expense || 0,
          subValue: "Tổng chi trong kỳ",
        },
        {
          key: "income",
          label: "Lợi nhuận",
          color: "#047857",
          value: totals.income || 0,
          subValue: "Sau khi trừ chi phí",
        },
        {
          key: "debt",
          label: "Công nợ",
          color: "#b45309",
          value: totals.debt || 0,
          subValue: latestDay ? `Cập nhật tới ${moment(latestDay.time || latestDay.date).format("DD/MM/YYYY")}` : " ",
        },
      ],
    [latestDay, params.fromTime, params.toTime, totals.debt, totals.expense, totals.income, totals.revenue]
  );

  const visibleSeries = useMemo(
    () => [
      {
        name: SERIES_META.revenue.label,
        data: listRevenue.map((item) => (item.revenue || 0) / 1000000),
        color: SERIES_META.revenue.color,
      },
      {
        name: SERIES_META.expense.label,
        data: listRevenue.map((item) => (item.expense || 0) / 1000000),
        color: SERIES_META.expense.color,
      },
      {
        name: SERIES_META.income.label,
        data: listRevenue.map((item) => (item.income || 0) / 1000000),
        color: SERIES_META.income.color,
      },
      {
        name: SERIES_META.debt.label,
        data: listRevenue.map((item) => (item.debt || 0) / 1000000),
        color: SERIES_META.debt.color,
      },
    ],
    [listRevenue]
  );

  const chartRevenue = useMemo(
    () => ({
      chart: {
        type: "column",
        height: 360,
        backgroundColor: "transparent",
        style: {
          fontFamily: "Be Vietnam Pro, Roboto, sans-serif",
        },
        spacing: [12, 0, 12, 0],
      },
      title: { text: "" },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        useHtml: true,
        categories,
        crosshair: false,
        lineWidth: 0,
        tickWidth: 0,
        labels: {
          style: {
            color: "#9a9890",
            fontSize: "11px",
          },
        },
      },
      yAxis: {
        title: {
          text: "Triệu VNĐ",
          style: {
            color: "#56544c",
            fontSize: "12px",
            fontWeight: "500",
          },
        },
        gridLineColor: "rgba(0,0,0,0.06)",
        labels: {
          style: {
            color: "#9a9890",
            fontSize: "11px",
          },
        },
      },
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "#18180f",
        borderWidth: 0,
        borderRadius: 10,
        style: {
          color: "#ffffff",
        },
        pointFormat:
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;min-width:180px;"><span style="color:{series.color}">{series.name}</span><b>{point.y:.1f} triệu</b></div>',
      },
      plotOptions: {
        column: {
          borderWidth: 0,
          borderRadius: 4,
          pointPadding: 0.12,
          groupPadding: 0.16,
        },
      },
      series: visibleSeries,
    }),
    [categories, visibleSeries]
  );

  const chartTrend = useMemo(() => {
    const marginData = listRevenue.map((item) => {
      if (!item.revenue) {
        return 0;
      }
      return Number((((item.income || 0) / item.revenue) * 100).toFixed(1));
    });

    const debtRatioData = listRevenue.map((item) => {
      if (!item.revenue) {
        return 0;
      }
      return Number((((item.debt || 0) / item.revenue) * 100).toFixed(1));
    });

    return {
      chart: {
        type: "line",
        height: 360,
        backgroundColor: "transparent",
        style: {
          fontFamily: "Be Vietnam Pro, Roboto, sans-serif",
        },
        spacing: [12, 0, 12, 0],
      },
      title: { text: "" },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        categories: listRevenue.map((item) => moment(item.time || item.date).format("DD/MM")),
        lineWidth: 0,
        tickWidth: 0,
        labels: {
          style: {
            color: "#9a9890",
            fontSize: "11px",
          },
        },
      },
      yAxis: {
        title: {
          text: "%",
          style: {
            color: "#56544c",
            fontSize: "12px",
            fontWeight: "500",
          },
        },
        gridLineColor: "rgba(0,0,0,0.06)",
        labels: {
          style: {
            color: "#9a9890",
            fontSize: "11px",
          },
        },
      },
      tooltip: {
        shared: true,
        valueSuffix: "%",
      },
      plotOptions: {
        line: {
          marker: {
            enabled: true,
            radius: 3,
          },
          lineWidth: 2.5,
        },
      },
      series: [
        {
          name: "Biên lợi nhuận",
          data: marginData,
          color: "#047857",
        },
        {
          name: "Tỷ lệ công nợ",
          data: debtRatioData,
          color: "#b45309",
        },
      ],
    };
  }, [listRevenue]);

  const detailRows = useMemo(
    () =>
      listRevenue.map((item) => {
        const marginPercent = item.revenue ? ((item.income || 0) / item.revenue) * 100 : 0;
        const debtPercent = item.revenue ? ((item.debt || 0) / item.revenue) * 100 : 0;

        return {
          date: moment(item.time || item.date).format("DD/MM/YYYY"),
          weekday: moment(item.time || item.date).format("dddd"),
          revenue: item.revenue || 0,
          expense: item.expense || 0,
          income: item.income || 0,
          debt: item.debt || 0,
          marginPercent,
          debtPercent,
        };
      }),
    [listRevenue]
  );

  const salesChannelRows = useMemo(
    () => [
      {
        name: "Tại quầy (POS)",
        desc: "Bán trực tiếp tại cửa hàng",
        orders: 612,
        revenue: 168000000,
        avgOrder: 274000,
        ratio: "49.1%",
        trend: { label: "↑ Tăng mạnh", className: "badge badge-green" },
      },
      {
        name: "Website bán hàng",
        desc: "Đơn online từ web",
        orders: 338,
        revenue: 96000000,
        avgOrder: 284000,
        ratio: "28.1%",
        trend: { label: "↑ Tăng", className: "badge badge-green" },
      },
      {
        name: "Fanpage / Zalo OA",
        desc: "Đơn từ social inbox",
        orders: 214,
        revenue: 52000000,
        avgOrder: 243000,
        ratio: "15.2%",
        trend: { label: "→ Ổn định", className: "badge badge-amber" },
      },
      {
        name: "Sàn thương mại điện tử",
        desc: "Shopee, Lazada, TikTok Shop",
        orders: 120,
        revenue: 26000000,
        avgOrder: 217000,
        ratio: "7.6%",
        trend: { label: "↓ Giảm", className: "badge badge-red" },
      },
    ],
    []
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!listRevenue.length) {
    return (
      <div className="page__report--revenue page__report--revenue-empty">
        <SystemNotification description={<span>Hiện tại bạn chưa có doanh thu nào!</span>} type="no-item" />
      </div>
    );
  }

  return (
    <div className="page__report--revenue">
      <div className="kpi-row">
        {summaryCards.map((item) => (
          <button
            key={item.key}
            className="kpi kpi-button"
            onClick={() => undefined}
            type="button"
          >
            <div className="kpi-l">{item.label}</div>
            <div className="kpi-v" style={{ color: item.color }}>
              {item.value === null ? "--" : `${formatCurrency(item.value || 0, ".", "")}đ`}
            </div>
            <div className="kpi-meta">{item.subValue}</div>
          </button>
        ))}
      </div>

      <div className="chart-row">
        <div className="chart-card">
          <div className="cc-head">
            <div>
              <div className="cc-title">Diễn biến doanh thu theo ngày</div>
              <div className="cc-sub">Doanh thu, chi phí, lợi nhuận và công nợ trong kỳ</div>
            </div>
          </div>
          <div className="legend">
            {(Object.keys(SERIES_META) as RevenueSeriesKey[]).map((key) => (
              <div className="li" key={key}>
                <span className="ld" style={{ background: SERIES_META[key].color }}></span>
                {SERIES_META[key].label}
              </div>
            ))}
          </div>
          <div className="chart-wrap">
            <HighchartsReact highcharts={Highcharts} allowChartUpdate={true} options={chartRevenue} />
          </div>
        </div>

        <div className="chart-card">
          <div className="cc-head">
            <div>
              <div className="cc-title">Top sản phẩm bán chạy</div>
              <div className="cc-sub">Theo hiệu suất doanh thu và lợi nhuận trong kỳ</div>
            </div>
          </div>
          <div className="legend">
            <div className="li">
              <span className="ld" style={{ background: "#047857" }}></span>Biên lợi nhuận
            </div>
            <div className="li">
              <span className="ld" style={{ background: "#b45309" }}></span>Tỷ lệ công nợ
            </div>
          </div>
          <div className="chart-wrap">
            <HighchartsReact highcharts={Highcharts} allowChartUpdate={true} options={chartTrend} />
          </div>
        </div>
      </div>

      <div className="tbl-card">
        <div className="tbl-head">
          <h3>Phân tích doanh thu theo kênh bán hàng</h3>
          <span className="tbl-meta">Tháng 3/2026 · 4 kênh hoạt động</span>
        </div>
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr>
                <th>Kênh bán hàng</th>
                <th className="r">Số đơn</th>
                <th className="r">Doanh thu</th>
                <th className="r">Giá trị TB</th>
                <th className="r">Tỷ trọng</th>
                <th>Xu hướng</th>
              </tr>
            </thead>
            <tbody>
              {salesChannelRows.map((item) => (
                <tr key={item.name}>
                  <td>
                    <div className="table-primary">{item.name}</div>
                    <div className="table-secondary">{item.desc}</div>
                  </td>
                  <td className="r">{item.orders}</td>
                  <td className="r vb">{formatCurrency(item.revenue, ".", "")}đ</td>
                  <td className="r">{formatCurrency(item.avgOrder, ".", "")}đ</td>
                  <td className="r">{item.ratio}</td>
                  <td>
                    <span className={item.trend.className}>{item.trend.label}</span>
                  </td>
                </tr>
              ))}
              <tr className="summary-row">
                <td>
                  <div className="table-primary">Tổng cộng</div>
                </td>
                <td className="r">{salesChannelRows.reduce((acc, item) => acc + item.orders, 0)}</td>
                <td className="r vb">{formatCurrency(salesChannelRows.reduce((acc, item) => acc + item.revenue, 0), ".", "")}đ</td>
                <td className="r">{formatCurrency(Math.round(salesChannelRows.reduce((acc, item) => acc + item.avgOrder, 0) / salesChannelRows.length), ".", "")}đ</td>
                <td className="r">100%</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
