import React from "react";
import { formatCurrency } from "reborn-util";
import { CUSTOMER_KPIS } from "../mockData";

export default function CustomerKpiGrid() {
  return (
    <div className="kpi-grid">
      {CUSTOMER_KPIS.map((item) => (
        <div key={item.label} className="kpi-card">
          <div className="kpi-label">{item.label}</div>
          <div className={`kpi-value ${item.valueClass}`}>{item.isCurrency ? `${formatCurrency(item.value as number)} đ` : item.value}</div>
          <div className={`kpi-delta ${item.deltaClass}`}>{item.delta}</div>
        </div>
      ))}
    </div>
  );
}
