import React from "react";
import { formatCurrency } from "reborn-util";
import { IInventorySummary } from "services/InventoryReportService";

interface Props {
  summary: IInventorySummary;
  loading?: boolean;
}

export default function InventoryKpiGrid({ summary, loading }: Props) {
  const items = [
    { label: "Tổng nhập trong kỳ", value: summary.totalImport.toLocaleString("vi-VN"), note: "Số lượng nhập kho" },
    { label: "Tổng xuất trong kỳ", value: summary.totalExport.toLocaleString("vi-VN"), note: "Số lượng xuất kho" },
    { label: "Tồn cuối kỳ",        value: summary.closingQty.toLocaleString("vi-VN"),  note: "Số lượng còn lại" },
    { label: "Giá trị tồn kho",    value: `${formatCurrency(summary.stockValue)} đ`,    note: "Giá vốn đang lưu kho" },
    { label: "Cảnh báo dưới ngưỡng", value: String(summary.belowThreshold),             note: "SKU cần bổ sung" },
  ];

  return (
    <div className="report-kpi-grid">
      {items.map((item) => (
        <div key={item.label} className="report-kpi-card">
          <div className="report-kpi-card__label">{item.label}</div>
          <div className="report-kpi-card__value">{loading ? "..." : item.value}</div>
          <div className="report-kpi-card__note">{item.note}</div>
        </div>
      ))}
    </div>
  );
}