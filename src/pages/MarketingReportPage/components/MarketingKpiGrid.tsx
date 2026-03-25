import React from "react";
import Icon from "components/icon";
import ReportKpiGrid from "components/reportShared/ReportKpiGrid";

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
    <ReportKpiGrid
      items={items.map((item) => ({
        label: item.label,
        value: item.value,
        note: item.note,
        icon: <Icon name={item.icon} />,
        style: { "--report-color": item.color, "--report-bg": item.bg } as React.CSSProperties,
        cardClassName: "report-kpi-card",
        iconClassName: "report-kpi-card__icon",
        labelClassName: "report-kpi-card__label",
        valueClassName: "report-kpi-card__value",
        noteClassName: "report-kpi-card__note",
      }))}
      className="report-kpi-grid"
    />
  );
}
