import React from "react";
import { MOCK_FINANCE_REPORT } from "@/mocks/community-hub/reports";
import { formatCurrency } from "reborn-util";
import "../index.scss";
import ReportHeader from "../ReportHeader";
import ReportSignature from "../ReportSignature";

export default function ReportFinance() {
  document.title = "Báo cáo Tài chính & Công nợ";
  const f = (v: number) => formatCurrency(v, ".", "");

  return (
    <div className="ch-reports-page">
      <ReportHeader title="Tài chính & Công nợ" />
      <div className="ch-reports-page__section">
        <div className="report-cards">
          <div className="report-card"><div className="report-card__label">Doanh thu tháng</div><div className="report-card__value">{f(MOCK_FINANCE_REPORT.revenue_this_month)}đ</div></div>
          <div className="report-card danger"><div className="report-card__label">Chi phí tháng</div><div className="report-card__value">{f(MOCK_FINANCE_REPORT.expense_this_month)}đ</div></div>
          <div className="report-card accent"><div className="report-card__label">Lợi nhuận</div><div className="report-card__value">{f(MOCK_FINANCE_REPORT.profit_this_month)}đ</div></div>
          <div className="report-card"><div className="report-card__label">Biên lợi nhuận</div><div className="report-card__value">{MOCK_FINANCE_REPORT.profit_margin_pct}%</div></div>
        </div>
        <div className="report-cards">
          <div className="report-card warning"><div className="report-card__label">Phải thu (công nợ)</div><div className="report-card__value">{f(MOCK_FINANCE_REPORT.receivable_vnd)}đ</div></div>
          <div className="report-card danger"><div className="report-card__label">Quá hạn phải thu</div><div className="report-card__value">{f(MOCK_FINANCE_REPORT.overdue_receivable)}đ ({MOCK_FINANCE_REPORT.overdue_count} TV)</div></div>
          <div className="report-card"><div className="report-card__label">Phải trả (NCC, đối tác)</div><div className="report-card__value">{f(MOCK_FINANCE_REPORT.payable_vnd)}đ</div></div>
        </div>
        <div className="report-row">
          <div className="report-table-card">
            <h3>Cơ cấu doanh thu</h3>
            <table className="report-table">
              <thead><tr><th>Nguồn</th><th>Số tiền</th><th>Tỷ trọng</th></tr></thead>
              <tbody>{MOCK_FINANCE_REPORT.revenue_by_source.map((r) => <tr key={r.source}><td>{r.source}</td><td>{f(r.amount)}đ</td><td>{r.pct}%</td></tr>)}</tbody>
            </table>
          </div>
          <div className="report-table-card">
            <h3>Cơ cấu chi phí</h3>
            <table className="report-table">
              <thead><tr><th>Khoản mục</th><th>Số tiền</th><th>Tỷ trọng</th></tr></thead>
              <tbody>{MOCK_FINANCE_REPORT.expense_by_category.map((r) => <tr key={r.category}><td>{r.category}</td><td>{f(r.amount)}đ</td><td>{r.pct}%</td></tr>)}</tbody>
            </table>
          </div>
        </div>
        <div className="report-table-card">
          <h3>Xu hướng Doanh thu — Chi phí — Lợi nhuận</h3>
          <table className="report-table">
            <thead><tr><th>Tháng</th><th>Doanh thu</th><th>Chi phí</th><th>Lợi nhuận</th><th>Margin</th></tr></thead>
            <tbody>
              {MOCK_FINANCE_REPORT.monthly_trend.map((r) => {
                const margin = r.revenue > 0 ? Math.round((r.profit / r.revenue) * 100) : 0;
                return <tr key={r.month}><td>{r.month}</td><td>{f(r.revenue)}đ</td><td>{f(r.expense)}đ</td><td className="positive">{f(r.profit)}đ</td><td>{margin}%</td></tr>;
              })}
            </tbody>
          </table>
        </div>
        <div className="report-insight">
          <strong>Insight:</strong> Phí thành viên chiếm {MOCK_FINANCE_REPORT.revenue_by_source[0].pct}% doanh thu — nguồn thu ổn định.
          Có {MOCK_FINANCE_REPORT.overdue_count} thành viên nợ quá hạn {f(MOCK_FINANCE_REPORT.overdue_receivable)}đ cần thu hồi.
          Biên lợi nhuận {MOCK_FINANCE_REPORT.profit_margin_pct}% — tăng dần qua 4 tháng.
        </div>
      </div>
      <ReportSignature />
    </div>
  );
}
