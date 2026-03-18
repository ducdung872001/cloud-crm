import React from "react";
import { LANDING_REPORTS, type WarehouseReportViewKey } from "../mockData";

interface Props {
  onSelect: (view: WarehouseReportViewKey) => void;
}

export default function WarehouseReportLanding({ onSelect }: Props) {
  return (
    <div className="warehouse-report-landing">
      <div className="report-grid">
        {LANDING_REPORTS.map((item) => (
          <button key={item.key} className="report-card" onClick={() => onSelect(item.key)} type="button">
            <div className="rc-icon" style={{ background: item.iconBg }}>
              {item.icon}
            </div>
            <div className="rc-body">
              <div className="rc-title">{item.title}</div>
              <div className="rc-desc">{item.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
