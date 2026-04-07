import React from "react";
import { MOCK_MEMBER_REPORT } from "@/mocks/community-hub/reports";
import { formatCurrency } from "reborn-util";
import "../index.scss";

export default function ReportMembers() {
  document.title = "Báo cáo Thành viên";
  const f = (v: number) => formatCurrency(v, ".", "");

  return (
    <div className="ch-reports-page">
      <div className="ch-reports-page__header"><h2>Báo cáo Thành viên</h2></div>
      <div className="ch-reports-page__section">
        <div className="report-cards">
          <div className="report-card"><div className="report-card__label">Tổng đăng ký</div><div className="report-card__value">{MOCK_MEMBER_REPORT.total}</div></div>
          <div className="report-card accent"><div className="report-card__label">Đang hoạt động</div><div className="report-card__value">{MOCK_MEMBER_REPORT.active}</div></div>
          <div className="report-card danger"><div className="report-card__label">Hết hạn</div><div className="report-card__value">{MOCK_MEMBER_REPORT.expired}</div></div>
          <div className="report-card warning"><div className="report-card__label">Sắp hết hạn (7 ngày)</div><div className="report-card__value">{MOCK_MEMBER_REPORT.expiring_7_days}</div></div>
          <div className="report-card"><div className="report-card__label">LTV trung bình</div><div className="report-card__value">{f(MOCK_MEMBER_REPORT.lifetime_value_vnd)}đ</div></div>
        </div>
        <div className="report-row">
          <div className="report-table-card">
            <h3>Phân bổ theo gói</h3>
            <table className="report-table">
              <thead><tr><th>Gói</th><th>Số TV</th><th>Tỷ lệ</th></tr></thead>
              <tbody>{MOCK_MEMBER_REPORT.by_plan.map((r) => <tr key={r.plan}><td>{r.plan}</td><td>{r.count}</td><td>{r.pct}%</td></tr>)}</tbody>
            </table>
          </div>
          <div className="report-table-card">
            <h3>Phân bổ theo loại</h3>
            <table className="report-table">
              <thead><tr><th>Loại</th><th>Số TV</th></tr></thead>
              <tbody>{MOCK_MEMBER_REPORT.by_type.map((r) => <tr key={r.type}><td>{r.type}</td><td>{r.count}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="report-table-card">
            <h3>Top giới thiệu</h3>
            <table className="report-table">
              <thead><tr><th>Thành viên</th><th>Giới thiệu</th></tr></thead>
              <tbody>{MOCK_MEMBER_REPORT.top_referrers.map((r) => <tr key={r.name}><td>{r.name}</td><td className="accent">{r.referrals} TV</td></tr>)}</tbody>
            </table>
          </div>
        </div>
        <div className="report-insight">
          <strong>Insight:</strong> Thời gian ở lại trung bình <strong>{MOCK_MEMBER_REPORT.avg_stay_months} tháng</strong>.
          {MOCK_MEMBER_REPORT.expiring_7_days} thành viên sắp hết hạn trong 7 ngày — cần liên hệ gia hạn.
        </div>
      </div>
    </div>
  );
}
