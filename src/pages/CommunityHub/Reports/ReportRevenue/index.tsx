import React from "react";
import { MOCK_MRR_REPORT } from "@/mocks/community-hub/reports";
import { formatCurrency } from "reborn-util";
import "../index.scss";

export default function ReportRevenue() {
  document.title = "Báo cáo Doanh thu & MRR";
  const f = (v: number) => formatCurrency(v, ".", "");

  return (
    <div className="ch-reports-page">
      <div className="ch-reports-page__header"><h2>Doanh thu & MRR</h2></div>
      <div className="ch-reports-page__section">
        <div className="report-cards">
          <div className="report-card"><div className="report-card__label">MRR tháng này</div><div className="report-card__value">{f(MOCK_MRR_REPORT.current_month.mrr_vnd)}đ</div></div>
          <div className="report-card"><div className="report-card__label">ARR (dự kiến năm)</div><div className="report-card__value">{f(MOCK_MRR_REPORT.arr_vnd)}đ</div></div>
          <div className="report-card"><div className="report-card__label">Doanh thu TB/TV</div><div className="report-card__value">{f(MOCK_MRR_REPORT.current_month.avg_revenue_per_member)}đ</div></div>
          <div className="report-card accent"><div className="report-card__label">Tỷ lệ giữ chân</div><div className="report-card__value">{MOCK_MRR_REPORT.retention_rate_pct}%</div></div>
          <div className="report-card danger"><div className="report-card__label">Tỷ lệ rời (Churn)</div><div className="report-card__value">{MOCK_MRR_REPORT.churn_rate_pct}%</div></div>
        </div>
        <div className="report-row">
          <div className="report-table-card">
            <h3>Cơ cấu doanh thu tháng</h3>
            <table className="report-table">
              <thead><tr><th>Nguồn</th><th>Số tiền</th><th>Tỷ trọng</th></tr></thead>
              <tbody>
                <tr><td>Phí thành viên</td><td>{f(MOCK_MRR_REPORT.revenue_breakdown.membership_fee)}đ</td><td className="accent">89.4%</td></tr>
                <tr><td>Dịch vụ ngoài gói</td><td>{f(MOCK_MRR_REPORT.revenue_breakdown.extra_services)}đ</td><td>7.4%</td></tr>
                <tr><td>Khóa học trả phí</td><td>{f(MOCK_MRR_REPORT.revenue_breakdown.courses_paid)}đ</td><td>3.2%</td></tr>
              </tbody>
            </table>
          </div>
          <div className="report-table-card">
            <h3>Lịch sử MRR</h3>
            <table className="report-table">
              <thead><tr><th>Tháng</th><th>MRR</th><th>TV</th><th>Mới</th><th>Rời</th><th>Tăng trưởng</th></tr></thead>
              <tbody>
                {MOCK_MRR_REPORT.history.map((row, i) => {
                  const prev = i > 0 ? MOCK_MRR_REPORT.history[i - 1].mrr : row.mrr;
                  const g = prev > 0 ? Math.round(((row.mrr - prev) / prev) * 100) : 0;
                  return (
                    <tr key={row.month}>
                      <td>{row.month}</td><td>{f(row.mrr)}đ</td><td>{row.members}</td>
                      <td className="positive">+{row.new_m}</td><td className="negative">-{row.churn}</td>
                      <td className={g > 0 ? "positive" : ""}>{i === 0 ? "—" : `+${g}%`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
