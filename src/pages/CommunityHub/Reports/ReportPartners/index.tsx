import React from "react";
import { MOCK_PARTNER_REPORT } from "@/mocks/community-hub/reports";
import { formatCurrency } from "reborn-util";
import "../index.scss";

export default function ReportPartners() {
  document.title = "Báo cáo Đối tác";
  const f = (v: number) => formatCurrency(v, ".", "");

  return (
    <div className="ch-reports-page">
      <div className="ch-reports-page__header"><h2>Báo cáo Đối tác</h2></div>
      <div className="ch-reports-page__section">
        <div className="report-cards">
          <div className="report-card"><div className="report-card__label">Tổng đối tác</div><div className="report-card__value">{MOCK_PARTNER_REPORT.total_partners}</div></div>
          <div className="report-card"><div className="report-card__label">Tổng hoa hồng tháng</div><div className="report-card__value">{f(MOCK_PARTNER_REPORT.total_commission_vnd)}đ</div></div>
          <div className="report-card accent"><div className="report-card__label">TV giới thiệu</div><div className="report-card__value">{MOCK_PARTNER_REPORT.total_referrals}</div></div>
          <div className="report-card"><div className="report-card__label">Tổng học viên</div><div className="report-card__value">{MOCK_PARTNER_REPORT.total_students}</div></div>
        </div>
        <div className="report-row">
          <div className="report-table-card">
            <h3>Chi tiết đối tác</h3>
            <table className="report-table">
              <thead><tr><th>Đối tác</th><th>Vai trò</th><th>Hoa hồng</th><th>Giới thiệu</th><th>Khóa học</th><th>Học viên</th></tr></thead>
              <tbody>
                {MOCK_PARTNER_REPORT.by_partner.map((r) => (
                  <tr key={r.name}>
                    <td>{r.name}</td><td><span className={`tag role-${r.role.toLowerCase()}`}>{r.role}</span></td>
                    <td className="accent">{f(r.commission)}đ</td><td>{r.referrals}</td><td>{r.courses}</td><td>{r.students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="report-table-card">
            <h3>Hoa hồng theo tháng</h3>
            <table className="report-table">
              <thead><tr><th>Tháng</th><th>Tổng hoa hồng</th></tr></thead>
              <tbody>{MOCK_PARTNER_REPORT.commission_trend.map((r) => <tr key={r.month}><td>{r.month}</td><td>{f(r.amount)}đ</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
