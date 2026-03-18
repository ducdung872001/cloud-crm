import React, { Fragment, useMemo, useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import "./MarketingReportPage.scss";

type ChannelReport = {
  channel: string;
  leads: number;
  qualifiedLeads: number;
  conversions: number;
  spend: number;
  revenue: number;
};

type CampaignReport = {
  name: string;
  channel: string;
  owner: string;
  spend: number;
  leads: number;
  conversions: number;
  revenue: number;
  status: "running" | "optimized" | "paused";
};

const CHANNEL_OPTIONS = [
  { value: "all", label: "Tất cả kênh" },
  { value: "facebook", label: "Facebook Ads" },
  { value: "zalo", label: "Zalo OA" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

const VIEW_OPTIONS = [
  { value: "campaign", label: "Theo chiến dịch" },
  { value: "channel", label: "Theo kênh" },
];

const LEAD_TREND = [
  { label: "T10", reach: 22000, leads: 350, conversions: 78 },
  { label: "T11", reach: 24800, leads: 394, conversions: 92 },
  { label: "T12", reach: 28600, leads: 430, conversions: 106 },
  { label: "T01", reach: 30100, leads: 468, conversions: 114 },
  { label: "T02", reach: 29400, leads: 452, conversions: 108 },
  { label: "T03", reach: 33200, leads: 510, conversions: 126 },
];

const CHANNEL_REPORTS: ChannelReport[] = [
  { channel: "Facebook Ads", leads: 590, qualifiedLeads: 364, conversions: 146, spend: 86000000, revenue: 312000000 },
  { channel: "Zalo OA", leads: 280, qualifiedLeads: 166, conversions: 72, spend: 24000000, revenue: 118000000 },
  { channel: "Email", leads: 190, qualifiedLeads: 108, conversions: 48, spend: 12000000, revenue: 65000000 },
  { channel: "SMS", leads: 125, qualifiedLeads: 72, conversions: 31, spend: 8000000, revenue: 39000000 },
];

const CAMPAIGN_REPORTS: CampaignReport[] = [
  { name: "Retarget quý I", channel: "Facebook Ads", owner: "Mai Anh", spend: 28500000, leads: 176, conversions: 54, revenue: 124000000, status: "running" },
  { name: "Tái kích hoạt hội viên", channel: "Zalo OA", owner: "Ngọc Trâm", spend: 11800000, leads: 102, conversions: 28, revenue: 49000000, status: "optimized" },
  { name: "Cross-sell serum", channel: "Email", owner: "Khánh Linh", spend: 7200000, leads: 68, conversions: 19, revenue: 32500000, status: "running" },
  { name: "Flash sale cuối tuần", channel: "SMS", owner: "Phương Vy", spend: 4800000, leads: 44, conversions: 11, revenue: 18600000, status: "paused" },
  { name: "Lookalike khách hàng VIP", channel: "Facebook Ads", owner: "Mai Anh", spend: 23900000, leads: 158, conversions: 47, revenue: 106900000, status: "optimized" },
];

const CHANNEL_COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#ec4899"];

const STATUS_LABELS = {
  running: "Đang chạy",
  optimized: "Tối ưu tốt",
  paused: "Tạm dừng",
};

const STATUS_COLORS = {
  running: "#2563eb",
  optimized: "#10b981",
  paused: "#64748b",
};

Highcharts.setOptions({
  lang: {
    thousandsSep: ".",
    decimalPoint: ",",
  },
  chart: {
    style: { fontFamily: "inherit" },
  },
});

export default function MarketingReportPage() {
  document.title = "Báo cáo marketing";

  const [channel, setChannel] = useState("all");
  const [viewMode, setViewMode] = useState("campaign");
  const [dateRange, setDateRange] = useState<[string, string]>([
    moment().subtract(5, "months").startOf("month").format("YYYY-MM-DD"),
    moment().endOf("month").format("YYYY-MM-DD"),
  ]);

  const channels = useMemo(() => {
    if (channel === "all") {
      return CHANNEL_REPORTS;
    }

    const channelLabel = CHANNEL_OPTIONS.find((item) => item.value === channel)?.label;
    return CHANNEL_REPORTS.filter((item) => item.channel === channelLabel);
  }, [channel]);

  const campaigns = useMemo(() => {
    if (channel === "all") {
      return CAMPAIGN_REPORTS;
    }

    const channelLabel = CHANNEL_OPTIONS.find((item) => item.value === channel)?.label;
    return CAMPAIGN_REPORTS.filter((item) => item.channel === channelLabel);
  }, [channel]);

  const summary = useMemo(() => {
    return channels.reduce(
      (acc, item) => {
        acc.totalLeads += item.leads;
        acc.totalQualified += item.qualifiedLeads;
        acc.totalConversions += item.conversions;
        acc.totalSpend += item.spend;
        acc.totalRevenue += item.revenue;
        return acc;
      },
      {
        totalLeads: 0,
        totalQualified: 0,
        totalConversions: 0,
        totalSpend: 0,
        totalRevenue: 0,
      }
    );
  }, [channels]);

  const conversionRate = summary.totalLeads ? ((summary.totalConversions / summary.totalLeads) * 100).toFixed(1) : "0.0";
  const roas = summary.totalSpend ? (summary.totalRevenue / summary.totalSpend).toFixed(2) : "0.00";

  const kpiCards = [
    { label: "Lead tạo mới", value: summary.totalLeads.toLocaleString("vi-VN"), note: "Tổng lead trong kỳ", color: "#2563eb", bg: "#eff6ff", icon: "Package" },
    { label: "Lead chất lượng", value: summary.totalQualified.toLocaleString("vi-VN"), note: "Đạt điều kiện chăm sóc", color: "#0f766e", bg: "#ecfeff", icon: "CheckCircle" },
    { label: "Tỷ lệ chuyển đổi", value: `${conversionRate}%`, note: "Lead sang đơn hàng", color: "#7c3aed", bg: "#f5f3ff", icon: "TrendingUp" },
    { label: "Ngân sách tiêu", value: `${formatCurrency(summary.totalSpend)} đ`, note: "Chi phí marketing", color: "#d97706", bg: "#fffbeb", icon: "Money" },
    { label: "ROAS trung bình", value: `${roas}x`, note: "Doanh thu / chi phí", color: "#db2777", bg: "#fdf2f8", icon: "BarChart2" },
  ];

  const trendChartOptions = useMemo<Highcharts.Options>(() => {
    return {
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
    };
  }, [channel, dateRange]);

  const channelMixOptions = useMemo<Highcharts.Options>(() => {
    return {
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
    };
  }, [channels]);

  const channelPerformanceOptions = useMemo<Highcharts.Options>(() => {
    return {
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
    };
  }, [channels, viewMode]);

  return (
    <Fragment>
      <div className="page-content page-marketing-report">
        <TitleAction title="Báo cáo marketing" />

        <div className="report-toolbar">
          <div className="report-toolbar__item">
            <label>Kênh</label>
            <SelectCustom
              id="marketingChannel"
              name="marketingChannel"
              options={CHANNEL_OPTIONS}
              fill
              value={channel}
              onChange={(option) => setChannel(option.value)}
            />
          </div>

          <div className="report-toolbar__item">
            <label>Chế độ xem</label>
            <SelectCustom
              id="marketingView"
              name="marketingView"
              options={VIEW_OPTIONS}
              fill
              value={viewMode}
              onChange={(option) => setViewMode(option.value)}
            />
          </div>

          <div className="report-toolbar__item report-toolbar__item--date">
            <label>Khoảng thời gian</label>
            <DatePickerCustom value={dateRange} onChange={(range) => setDateRange(range)} placeholder="Chọn khoảng ngày..." />
          </div>
        </div>

        <div className="report-kpi-grid">
          {kpiCards.map((item) => (
            <div
              key={item.label}
              className="report-kpi-card"
              style={{ "--report-color": item.color, "--report-bg": item.bg } as React.CSSProperties}
            >
              <div className="report-kpi-card__icon">
                <Icon name={item.icon} />
              </div>
              <div className="report-kpi-card__body">
                <div className="report-kpi-card__label">{item.label}</div>
                <div className="report-kpi-card__value">{item.value}</div>
                <div className="report-kpi-card__note">{item.note}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="report-grid">
          <div className="report-panel report-panel--wide">
            <div className="report-panel__header">
              <div className="report-panel__title">Xu hướng marketing</div>
              <div className="report-panel__sub">Reach, lead và chuyển đổi theo kỳ báo cáo</div>
            </div>
            <HighchartsReact highcharts={Highcharts} options={trendChartOptions} />
          </div>

          <div className="report-panel">
            <div className="report-panel__header">
              <div className="report-panel__title">Cơ cấu lead theo kênh</div>
              <div className="report-panel__sub">Phân bổ lead đầu vào</div>
            </div>
            <HighchartsReact highcharts={Highcharts} options={channelMixOptions} />
            <div className="report-legend">
              {channels.map((item, index) => (
                <div key={item.channel} className="report-legend__item">
                  <span className="report-legend__dot" style={{ backgroundColor: CHANNEL_COLORS[index % CHANNEL_COLORS.length] }} />
                  <span>{item.channel}</span>
                  <strong>{item.leads}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="report-panel report-panel--wide">
            <div className="report-panel__header">
              <div className="report-panel__title">Hiệu suất theo kênh</div>
              <div className="report-panel__sub">So sánh lead và chuyển đổi giữa các kênh</div>
            </div>
            <HighchartsReact highcharts={Highcharts} options={channelPerformanceOptions} />
          </div>

          <div className="report-panel">
            <div className="report-panel__header">
              <div className="report-panel__title">Tóm tắt ngân sách</div>
              <div className="report-panel__sub">Phân bổ chi phí theo kênh</div>
            </div>
            <div className="channel-budget-list">
              {channels.map((item, index) => {
                const percentage = summary.totalSpend ? Math.round((item.spend / summary.totalSpend) * 100) : 0;
                return (
                  <div key={item.channel} className="channel-budget-item">
                    <div className="channel-budget-item__row">
                      <strong>{item.channel}</strong>
                      <span>{formatCurrency(item.spend)} đ</span>
                    </div>
                    <div className="channel-budget-item__bar">
                      <div
                        className="channel-budget-item__fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
                        }}
                      />
                    </div>
                    <div className="channel-budget-item__meta">
                      <span>{percentage}% ngân sách</span>
                      <span>{item.conversions} chuyển đổi</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="report-table-card">
          <div className="report-table-card__header">
            <div>
              <div className="report-panel__title">Bảng chiến dịch marketing</div>
              <div className="report-panel__sub">Theo dõi ngân sách, lead và doanh thu từng chiến dịch</div>
            </div>
          </div>

          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Chiến dịch</th>
                  <th>Kênh</th>
                  <th>Phụ trách</th>
                  <th className="text-right">Chi phí</th>
                  <th className="text-right">Lead</th>
                  <th className="text-right">Chuyển đổi</th>
                  <th className="text-right">Doanh thu</th>
                  <th className="text-right">ROAS</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((item) => {
                  const itemRoas = item.spend ? (item.revenue / item.spend).toFixed(2) : "0.00";
                  return (
                    <tr key={item.name}>
                      <td className="font-semibold">{item.name}</td>
                      <td>{item.channel}</td>
                      <td>{item.owner}</td>
                      <td className="text-right">{formatCurrency(item.spend)} đ</td>
                      <td className="text-right">{item.leads}</td>
                      <td className="text-right">{item.conversions}</td>
                      <td className="text-right">{formatCurrency(item.revenue)} đ</td>
                      <td className="text-right">{itemRoas}x</td>
                      <td>
                        <span
                          className={`report-status report-status--${item.status}`}
                          style={{ "--status-color": STATUS_COLORS[item.status] } as React.CSSProperties}
                        >
                          {STATUS_LABELS[item.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
