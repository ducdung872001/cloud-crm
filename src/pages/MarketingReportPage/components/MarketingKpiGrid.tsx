import React from "react";
import Icon from "components/icon";

interface KpiItem {
  label: string;
  value: string;
  note: string;
  color: string;
  bg: string;
  icon: string;
}

interface Props {
  items: KpiItem[];
}

export default function MarketingKpiGrid({ items }: Props) {
  return (
    <div className="report-kpi-grid">
      {items.map((item) => (
        <div
          key={item.label}
          className="report-kpi-card"
          style={{ "--report-color": item.color, "--report-bg": item.bg } as React.CSSProperties}
        >
          <div className="report-kpi-card__icon">
            <Icon name={item.icon} />
          </div>
          <div className="report-kpi-card__body">
            <div className="report-kpi-card__label">{item.label}</div>
            <div className="report-kpi-card__value">{item.value}</div>
            <div className="report-kpi-card__note">{item.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
