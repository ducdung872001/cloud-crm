import React from "react";
import { MOCK_SERVICE_REPORT } from "@/mocks/community-hub/reports";
import { formatCurrency } from "reborn-util";
import "../index.scss";

export default function ReportServices() {
  document.title = "Báo cáo Dịch vụ";
  const f = (v: number) => formatCurrency(v, ".", "");

  return (
    <div className="ch-reports-page">
      <div className="ch-reports-page__header"><h2>Báo cáo Dịch vụ</h2></div>
      <div className="ch-reports-page__section">
        <div className="report-cards">
          <div className="report-card"><div className="report-card__label">Tổng lượt sử dụng</div><div className="report-card__value">{MOCK_SERVICE_REPORT.total_usage_this_month}</div></div>
          <div className="report-card accent"><div className="report-card__label">Quota TB sử dụng</div><div className="report-card__value">{MOCK_SERVICE_REPORT.quota_utilization_pct}%</div></div>
          <div className="report-card warning"><div className="report-card__label">TV dùng &gt; 80% quota</div><div className="report-card__value">{MOCK_SERVICE_REPORT.members_over_80_pct_quota}</div></div>
        </div>
        <div className="report-table-card">
          <h3>Chi tiết theo dịch vụ</h3>
          <table className="report-table">
            <thead><tr><th>Dịch vụ</th><th>Lượt dùng</th><th>TB/TV</th><th>Doanh thu phát sinh</th><th>Loại</th></tr></thead>
            <tbody>
              {MOCK_SERVICE_REPORT.by_service.map((r) => (
                <tr key={r.service}>
                  <td>{r.service}</td><td>{r.usage}</td><td>{r.avg_per_member}</td>
                  <td>{r.revenue > 0 ? f(r.revenue) + "đ" : "—"}</td>
                  <td><span className={`tag ${r.in_plan ? "in-plan" : "extra"}`}>{r.in_plan ? "Trong gói" : "Ngoài gói"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {MOCK_SERVICE_REPORT.upsell_opportunities.length > 0 && (
          <div className="report-table-card">
            <h3>Cơ hội upsell</h3>
            <table className="report-table">
              <thead><tr><th>Dịch vụ</th><th>Số TV tiềm năng</th><th>Lý do</th></tr></thead>
              <tbody>
                {MOCK_SERVICE_REPORT.upsell_opportunities.map((r) => (
                  <tr key={r.service}><td>{r.service}</td><td className="accent">{r.members}</td><td>{r.reason}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
