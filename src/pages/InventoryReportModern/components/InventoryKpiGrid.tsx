import React from "react";
import { formatCurrency } from "reborn-util";
import { IInventorySummary } from "services/InventoryReportService";
import { INVENTORY_KPIS } from "../mockData";

interface Props {
  summary?: IInventorySummary;
  loading?: boolean;
}

// Default mock dùng khi prop chưa được truyền
const DEFAULT_SUMMARY: IInventorySummary = {
  totalImport:    9860,
  totalExport:    7325,
  closingQty:     4750,
  stockValue:     3155000000,
  belowThreshold: 34,
};

export default function InventoryKpiGrid({ summary = DEFAULT_SUMMARY, loading }: Props) {
  const items = [
    { label: "Tổng nhập trong kỳ",   value: (summary.totalImport    ?? 0).toLocaleString("vi-VN"), note: "Số lượng nhập kho" },
    { label: "Tổng xuất trong kỳ",   value: (summary.totalExport    ?? 0).toLocaleString("vi-VN"), note: "Số lượng xuất kho" },
    { label: "Tồn cuối kỳ",          value: (summary.closingQty     ?? 0).toLocaleString("vi-VN"), note: "Số lượng còn lại" },
    { label: "Giá trị tồn kho",      value: `${formatCurrency(summary.stockValue ?? 0)} đ`,         note: "Giá vốn đang lưu kho" },
    { label: "Cảnh báo dưới ngưỡng", value: String(summary.belowThreshold ?? 0),                    note: "SKU cần bổ sung" },
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