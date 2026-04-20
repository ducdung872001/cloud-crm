import React from "react";
import type { WarehouseReportViewKey } from "../mockData";

interface Props {
  currentView: WarehouseReportViewKey;
  onBack: () => void;
}

export default function WarehouseReportTopbar({ currentView, onBack }: Props) {
  return (
    <div className="warehouse-report-topbar">
      <div className="warehouse-report-topbar__breadcrumb">
        <button type="button" onClick={onBack} className="breadcrumb-link">
          Hàng hóa & Kho
        </button>
        <span className="breadcrumb-sep">›</span>
      </div>
    </div>
  );
}
