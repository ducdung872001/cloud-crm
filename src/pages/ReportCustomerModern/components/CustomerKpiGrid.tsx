import React from "react";
import { formatCurrency } from "reborn-util";
import ReportKpiGrid from "components/reportShared/ReportKpiGrid";
import { CUSTOMER_KPIS } from "../mockData";

export default function CustomerKpiGrid() {
  const items = CUSTOMER_KPIS.map((item) => ({
    label: item.label,
    value: item.isCurrency ? `${formatCurrency(item.value as number)} đ` : item.value,
    note: item.delta,
    valueClassName: item.valueClass,
    noteClassName: item.deltaClass,
  }));

  return (
    <ReportKpiGrid items={items} className="kpi-grid" cardClassName="kpi-card" />
  );
}
