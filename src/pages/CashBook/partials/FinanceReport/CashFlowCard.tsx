import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Icon from "components/icon";
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
    <div className="finance-report__card">
      <div className="finance-report__card-body finance-report__card-body--enter" key={`cashflow-${displayTabType}-${refreshKey}`}>
        <div className="finance-report__card-header">
          <div>
            <div className="finance-report__card-title">Dòng tiền thu chi gần đây</div>
            <div className="finance-report__card-subtitle">Nhóm theo ngày phát sinh trong dữ liệu đang hiển thị</div>
          </div>
          <button className={`finance-report__reset-btn${isRefreshing ? " is-spinning" : ""}`} type="button" onClick={onReset} title="Reset dữ liệu">
            <Icon name="Refresh" />
          </button>
        </div>
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
    </div>
  );
}
