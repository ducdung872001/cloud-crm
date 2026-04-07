// [CH] Community Hub - Report header dùng chung cho tất cả trang báo cáo
import React, { useState, useCallback } from "react";
import Icon from "@/components/icon";
import { showToast } from "utils/common";

interface Props {
  title: string;
}

export default function ReportHeader({ title }: Props) {
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    setExporting(true);
    setTimeout(() => {
      showToast(`Đã xuất báo cáo "${title}" thành công`, "success");
      setExporting(false);
    }, 1500);
  };

  const handlePrint = useCallback(() => {
    // Lấy nội dung báo cáo (section + signature)
    const reportEl = document.querySelector(".ch-reports-page");
    if (!reportEl) return;

    // Clone nội dung, bỏ nút actions
    const clone = reportEl.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".no-print, .report-actions").forEach((el) => el.remove());

    // Hiện phần chữ ký
    clone.querySelectorAll(".report-signature").forEach((el) => {
      (el as HTMLElement).style.display = "block";
    });

    // Mở cửa sổ in riêng — không có sidebar, header
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 2rem; color: #1B2E2A; font-size: 13px; }
          h2 { font-size: 20px; font-weight: 700; margin-bottom: 1.5rem; }
          h3 { font-size: 15px; font-weight: 600; margin-bottom: 0.8rem; }
          .report-cards { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
          .report-card { border: 1px solid #ddd; border-radius: 8px; padding: 12px 16px; min-width: 140px; flex: 1; }
          .report-card__label { font-size: 11px; color: #6B8078; margin-bottom: 4px; }
          .report-card__value { font-size: 18px; font-weight: 700; }
          .report-card.accent .report-card__value { color: #2D6A5A; }
          .report-card.danger .report-card__value { color: #D64B3A; }
          .report-card.warning .report-card__value { color: #E8922A; }
          .report-row { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; }
          .report-row > * { flex: 1; }
          .report-table-card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 1.5rem; page-break-inside: avoid; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 6px 10px; text-align: left; font-size: 12px; border-bottom: 1px solid #eee; }
          th { font-weight: 600; color: #6B8078; background: #fafaf8; }
          .positive { color: #2D6A5A; }
          .negative { color: #D64B3A; }
          .accent { color: #2D6A5A; font-weight: 600; }
          .tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
          .tag.in-plan { background: rgba(45,106,90,0.1); color: #2D6A5A; }
          .tag.extra { background: rgba(212,165,116,0.15); color: #9a7340; }
          .tag.role-kol { background: #e8eaf6; color: #3f51b5; }
          .tag.role-koc { background: #e0f7fa; color: #00838f; }
          .tag.role-po { background: #fce4ec; color: #c62828; }
          .occupancy-bar { display: flex; align-items: center; gap: 8px; height: 14px; background: #f0f0ec; border-radius: 4px; min-width: 100px; }
          .occupancy-fill { height: 100%; border-radius: 4px; }
          .occupancy-fill.high { background: #E8922A; }
          .occupancy-fill.medium { background: #2D6A5A; }
          .occupancy-fill.low { background: #3D9E6A; }
          .report-insight { background: rgba(45,106,90,0.06); border-left: 4px solid #2D6A5A; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 12px; line-height: 1.6; margin-bottom: 1.5rem; }
          .report-signature { margin-top: 3rem; page-break-inside: avoid; }
          .report-signature__date { text-align: right; font-size: 13px; font-style: italic; margin-bottom: 2rem; }
          .report-signature__grid { display: flex; justify-content: space-between; text-align: center; }
          .report-signature__col { flex: 1; }
          .report-signature__title { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
          .report-signature__hint { font-size: 12px; font-style: italic; color: #6B8078; }
          .report-signature__space { height: 80px; }
        </style>
      </head>
      <body>
        ${clone.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }, [title]);

  return (
    <div className="ch-reports-page__header">
      <h2>{title}</h2>
      <div className="report-actions no-print">
        <button className="report-btn report-btn--outline" onClick={handlePrint}>
          <Icon name="Print" />
          <span>In báo cáo</span>
        </button>
        <button
          className="report-btn report-btn--primary"
          onClick={handleExportExcel}
          disabled={exporting}
        >
          <Icon name="Download" />
          <span>{exporting ? "Đang xuất..." : "Xuất Excel"}</span>
        </button>
      </div>
    </div>
  );
}
