import React from "react";
import { formatCurrency } from "reborn-util";
import ReportKpiGrid from "components/reportShared/ReportKpiGrid";
import { IInventorySummary } from "services/InventoryReportService";

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
    { label: "Tổng nhập trong kỳ", value: loading ? "..." : (summary.totalImport ?? 0).toLocaleString("vi-VN"), note: "Số lượng nhập kho" },
    { label: "Tổng xuất trong kỳ", value: loading ? "..." : (summary.totalExport ?? 0).toLocaleString("vi-VN"), note: "Số lượng xuất kho" },
    { label: "Tồn cuối kỳ", value: loading ? "..." : (summary.closingQty ?? 0).toLocaleString("vi-VN"), note: "Số lượng còn lại" },
    { label: "Giá trị tồn kho", value: loading ? "..." : `${formatCurrency(summary.stockValue ?? 0)} đ`, note: "Giá vốn đang lưu kho" },
    { label: "Cảnh báo dưới ngưỡng", value: loading ? "..." : String(summary.belowThreshold ?? 0), note: "SKU cần bổ sung" },
  ];

  return <ReportKpiGrid items={items} className="report-kpi-grid" cardClassName="report-kpi-card" />;
}
