import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Icon from "components/icon";
import { Options } from "highcharts";
import { ExpenseCategoryPoint } from "./types";

interface ExpenseCardProps {
  displayTabType: number;
  refreshKey: number;
  isRefreshing: boolean;
  chartOptions: Options;
  hasData: boolean;
  expenseSeries: ExpenseCategoryPoint[];
  expenseColors: string[];
  onReset: () => void;
}

export default function ExpenseCard(props: ExpenseCardProps) {
  const { displayTabType, refreshKey, isRefreshing, chartOptions, hasData, expenseSeries, expenseColors, onReset } = props;

  return (
    <div className="finance-report__card">
      <div className="finance-report__card-body finance-report__card-body--enter" key={`expense-${displayTabType}-${refreshKey}`}>
        <div className="finance-report__card-header">
          <div>
            <div className="finance-report__card-title">Cơ cấu chi phí</div>
            <div className="finance-report__card-subtitle">Top nhóm chi lớn nhất theo danh mục giao dịch</div>
          </div>
          <button className={`finance-report__reset-btn${isRefreshing ? " is-spinning" : ""}`} type="button" onClick={onReset} title="Reset dữ liệu">
            <Icon name="Refresh" />
          </button>
        </div>
        <div className="finance-report__legend">
          {expenseSeries.map((item, index) => (
            <div className="finance-report__legend-item" key={item.label}>
              <span className="finance-report__legend-dot" style={{ background: expenseColors[index] || expenseColors[expenseColors.length - 1] }}></span>
              {item.label} {item.percent}%
            </div>
          ))}
        </div>
        <div className="finance-report__chart-wrap finance-report__chart-wrap--cost">
          {hasData ? (
            <HighchartsReact key={`expense-chart-${displayTabType}-${refreshKey}`} highcharts={Highcharts} options={chartOptions} />
          ) : (
            <div className="finance-report__table-meta">Chưa có dữ liệu chi phí để phân tích.</div>
          )}
        </div>
      </div>
    </div>
  );
}
