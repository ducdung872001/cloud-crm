import React from "react";
import { formatCurrency } from "reborn-util";

interface KpisProps {
  displayTabType: number;
  totalRevenue: number;
  totalExpenditure: number;
  totalItem: number;
  prevBalance: number;
  posBalance: number;
  prevTotalByPage: number;
}

export default function Kpis(props: KpisProps) {
  const { displayTabType, totalRevenue, totalExpenditure, totalItem, prevBalance, posBalance, prevTotalByPage } = props;

  return (
    <div className="finance-report__kpis">
      <div className="finance-report__kpi">
        <div className="finance-report__kpi-label">Tổng thu</div>
        <div className="finance-report__kpi-value green">{formatCurrency(totalRevenue || 0)}</div>
        <div className="finance-report__kpi-note">Tổng dòng tiền vào theo bộ lọc hiện tại</div>
      </div>
      <div className="finance-report__kpi">
        <div className="finance-report__kpi-label">Tổng chi</div>
        <div className="finance-report__kpi-value red">{formatCurrency(totalExpenditure || 0)}</div>
        <div className="finance-report__kpi-note">Tổng dòng tiền ra theo bộ lọc hiện tại</div>
      </div>
      <div className="finance-report__kpi">
        <div className="finance-report__kpi-label">{displayTabType === 1 ? "Số giao dịch" : "Tồn đầu kỳ"}</div>
        <div className="finance-report__kpi-value blue">{displayTabType === 1 ? `${totalItem || 0}` : formatCurrency(prevBalance || 0)}</div>
        <div className="finance-report__kpi-note">
          {displayTabType === 1 ? "Tổng số phiếu trong danh sách hiện tại" : "Số dư tại thời điểm bắt đầu kỳ"}
        </div>
      </div>
      <div className="finance-report__kpi">
        <div className={`finance-report__kpi-value ${displayTabType === 1 ? "amber" : posBalance >= 0 ? "amber" : "red"}`}>
          {displayTabType === 1 ? formatCurrency((totalRevenue || 0) - (totalExpenditure || 0)) : formatCurrency(posBalance || 0)}
        </div>
        <div className="finance-report__kpi-label">{displayTabType === 1 ? "Chênh lệch thu chi" : "Tồn cuối kỳ"}</div>
        <div className="finance-report__kpi-note">
          {displayTabType === 1 ? "Thu trừ chi trong kỳ đang xem" : `Lũy kế trước trang hiện tại ${formatCurrency(prevTotalByPage || 0)}`}
        </div>
      </div>
    </div>
  );
}
