import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Icon from "components/icon";
import ReportPanel from "components/reportShared/ReportPanel";
import { Options } from "highcharts";

interface CashFlowCardProps {
  displayTabType: number;
  refreshKey: number;
  isRefreshing: boolean;
  chartOptions: Options;
  hasData: boolean;
  onReset: () => void;
}

export default function CashFlowCard(props: CashFlowCardProps) {
  const { displayTabType, refreshKey, isRefreshing, chartOptions, hasData, onReset } = props;

  return (
    <ReportPanel
      className="finance-report__card"
      bodyClassName="finance-report__card-body finance-report__card-body--enter"
      headerClassName="finance-report__card-header"
      titleClassName="finance-report__card-title"
      subtitleClassName="finance-report__card-subtitle"
      title="Dòng tiền thu chi gần đây"
      subtitle="Nhóm theo ngày phát sinh trong dữ liệu đang hiển thị"
      headerRight={
        <button className={`finance-report__reset-btn${isRefreshing ? " is-spinning" : ""}`} type="button" onClick={onReset} title="Reset dữ liệu">
          <Icon name="Refresh" />
        </button>
      }
    >
      <div key={`cashflow-${displayTabType}-${refreshKey}`}>
        <div className="finance-report__legend">
          <div className="finance-report__legend-item">
            <span className="finance-report__legend-dot income"></span> Thu
          </div>
          <div className="finance-report__legend-item">
            <span className="finance-report__legend-dot expense"></span> Chi
          </div>
        </div>
        <div className="finance-report__chart-wrap">
          {hasData ? (
            <HighchartsReact key={`cashflow-chart-${displayTabType}-${refreshKey}`} highcharts={Highcharts} options={chartOptions} />
          ) : (
            <div className="finance-report__table-meta">Chưa có dữ liệu dòng tiền để hiển thị biểu đồ.</div>
          )}
        </div>
      </div>
    </ReportPanel>
  );
}
