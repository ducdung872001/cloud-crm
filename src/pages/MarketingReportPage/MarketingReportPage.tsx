import React, { Fragment, useMemo, useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import { CAMPAIGN_REPORTS, CHANNEL_COLORS, CHANNEL_OPTIONS, CHANNEL_REPORTS } from "./mockData";
import { createChannelMixOptions, createChannelPerformanceOptions, createTrendChartOptions } from "./chartOptions";
import MarketingFilterBar from "./components/MarketingFilterBar";
import MarketingKpiGrid from "./components/MarketingKpiGrid";
import MarketingBudgetSummary from "./components/MarketingBudgetSummary";
import MarketingCampaignTable from "./components/MarketingCampaignTable";
import "./MarketingReportPage.scss";

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

  const trendChartOptions = useMemo<Highcharts.Options>(() => createTrendChartOptions(), [channel, dateRange]);
  const channelMixOptions = useMemo<Highcharts.Options>(() => createChannelMixOptions(channels), [channels]);
  const channelPerformanceOptions = useMemo<Highcharts.Options>(() => createChannelPerformanceOptions(channels), [channels, viewMode]);

  return (
    <Fragment>
      <div className="page-content page-marketing-report">
        <TitleAction title="Báo cáo marketing" />

        <MarketingFilterBar
          channel={channel}
          setChannel={setChannel}
          viewMode={viewMode}
          setViewMode={setViewMode}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        <MarketingKpiGrid items={kpiCards} />

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

          <MarketingBudgetSummary channels={channels} totalSpend={summary.totalSpend} />
        </div>
        <MarketingCampaignTable campaigns={campaigns} />
      </div>
    </Fragment>
  );
}
