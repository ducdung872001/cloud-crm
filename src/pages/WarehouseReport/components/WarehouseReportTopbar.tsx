import React from "react";
import type { WarehouseReportViewKey } from "../mockData";

interface Props {
  currentView: WarehouseReportViewKey;
  onBack: () => void;
}

const VIEW_TITLES: Record<WarehouseReportViewKey, string> = {
  landing: "Báo cáo kho",
  xnt: "Báo cáo Nhập Xuất Tồn",
  cost: "Giá vốn hàng tồn",
  slow: "Hàng chậm luân chuyển",
  history: "Lịch sử theo sản phẩm",
};

export default function WarehouseReportTopbar({ currentView, onBack }: Props) {
  return (
    <div className="warehouse-report-topbar">
      <div className="warehouse-report-topbar__breadcrumb">
        <button type="button" onClick={onBack} className="breadcrumb-link">
          Hàng hóa & Kho
        </button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{VIEW_TITLES[currentView]}</span>
      </div>
    </div>
  );
}
