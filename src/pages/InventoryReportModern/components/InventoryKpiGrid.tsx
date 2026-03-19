import React from "react";
import { formatCurrency } from "reborn-util";
import { INVENTORY_KPIS } from "../mockData";

export default function InventoryKpiGrid() {
  return (
    <div className="report-kpi-grid">
      {INVENTORY_KPIS.map((item) => (
        <div key={item.label} className="report-kpi-card">
          <div className="report-kpi-card__label">{item.label}</div>
          <div className="report-kpi-card__value">{item.isCurrency ? `${formatCurrency(item.value as number)} đ` : item.value}</div>
          <div className="report-kpi-card__note">{item.note}</div>
        </div>
      ))}
    </div>
  );
}
