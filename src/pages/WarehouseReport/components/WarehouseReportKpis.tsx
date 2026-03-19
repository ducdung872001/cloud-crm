import React from "react";

interface KpiItem {
  label: string;
  value: string;
  valueClass: string;
  delta: string;
  deltaClass: string;
}

interface Props {
  items: KpiItem[];
}

export default function WarehouseReportKpis({ items }: Props) {
  return (
    <div className="kpi-row">
      {items.map((item) => (
        <div key={item.label} className="kpi">
          <div className="kpi-l">{item.label}</div>
          <div className={`kpi-v ${item.valueClass}`}>{item.value}</div>
          <div className={`kpi-d ${item.deltaClass}`}>{item.delta}</div>
        </div>
      ))}
    </div>
  );
}
