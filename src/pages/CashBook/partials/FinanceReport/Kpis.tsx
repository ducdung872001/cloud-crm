import React from "react";
import { formatCurrency } from "reborn-util";
import ReportKpiGrid from "components/reportShared/ReportKpiGrid";

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

  const items = [
    {
      label: "Tổng thu",
      value: formatCurrency(totalRevenue || 0),
      note: "Tổng dòng tiền vào theo bộ lọc hiện tại",
      valueClassName: "finance-report__kpi-value green",
      labelClassName: "finance-report__kpi-label",
      noteClassName: "finance-report__kpi-note",
    },
    {
      label: "Tổng chi",
      value: formatCurrency(totalExpenditure || 0),
      note: "Tổng dòng tiền ra theo bộ lọc hiện tại",
      valueClassName: "finance-report__kpi-value red",
      labelClassName: "finance-report__kpi-label",
      noteClassName: "finance-report__kpi-note",
    },
    {
      label: displayTabType === 1 ? "Số giao dịch" : "Tồn đầu kỳ",
      value: displayTabType === 1 ? `${totalItem || 0}` : formatCurrency(prevBalance || 0),
      note: displayTabType === 1 ? "Tổng số phiếu trong danh sách hiện tại" : "Số dư tại thời điểm bắt đầu kỳ",
      valueClassName: "finance-report__kpi-value blue",
      labelClassName: "finance-report__kpi-label",
      noteClassName: "finance-report__kpi-note",
    },
    {
      label: displayTabType === 1 ? "Chênh lệch thu chi" : "Tồn cuối kỳ",
      value: displayTabType === 1 ? formatCurrency((totalRevenue || 0) - (totalExpenditure || 0)) : formatCurrency(posBalance || 0),
      note: displayTabType === 1 ? "Thu trừ chi trong kỳ đang xem" : `Lũy kế trước trang hiện tại ${formatCurrency(prevTotalByPage || 0)}`,
      valueClassName: `finance-report__kpi-value ${displayTabType === 1 ? "amber" : posBalance >= 0 ? "amber" : "red"}`,
      labelClassName: "finance-report__kpi-label",
      noteClassName: "finance-report__kpi-note",
    },
  ];

  return <ReportKpiGrid items={items} className="finance-report__kpis" cardClassName="finance-report__kpi" />;
}
