import React from "react";
import { MOCK_CHECKIN_REPORT } from "@/mocks/community-hub/reports";
import "../index.scss";

export default function ReportCheckin() {
  document.title = "Báo cáo Check-in";

  return (
    <div className="ch-reports-page">
      <div className="ch-reports-page__header"><h2>Báo cáo Check-in</h2></div>
      <div className="ch-reports-page__section">
        <div className="report-cards">
          <div className="report-card"><div className="report-card__label">Hôm nay</div><div className="report-card__value">{MOCK_CHECKIN_REPORT.today} lượt</div></div>
          <div className="report-card"><div className="report-card__label">Tuần này</div><div className="report-card__value">{MOCK_CHECKIN_REPORT.this_week} lượt</div></div>
          <div className="report-card"><div className="report-card__label">Tháng này</div><div className="report-card__value">{MOCK_CHECKIN_REPORT.this_month} lượt</div></div>
          <div className="report-card accent"><div className="report-card__label">TB/ngày</div><div className="report-card__value">{MOCK_CHECKIN_REPORT.avg_per_day}</div></div>
          <div className="report-card"><div className="report-card__label">Giờ cao điểm</div><div className="report-card__value">{MOCK_CHECKIN_REPORT.peak_hour}</div></div>
        </div>
        <div className="report-row">
          <div className="report-table-card">
            <h3>Lượt check-in theo khu vực</h3>
            <table className="report-table">
              <thead><tr><th>Khu vực</th><th>Lượt</th><th>Tỷ lệ</th></tr></thead>
              <tbody>{MOCK_CHECKIN_REPORT.by_area.map((r) => <tr key={r.area}><td>{r.area}</td><td>{r.count}</td><td>{r.pct}%</td></tr>)}</tbody>
            </table>
          </div>
          <div className="report-table-card">
            <h3>Tỷ lệ lấp đầy (Occupancy)</h3>
            <table className="report-table">
              <thead><tr><th>Khu vực</th><th>Occupancy</th></tr></thead>
              <tbody>
                {MOCK_CHECKIN_REPORT.occupancy_rate.map((r) => (
                  <tr key={r.area}>
                    <td>{r.area}</td>
                    <td>
                      <div className="occupancy-bar">
                        <div className={`occupancy-fill ${r.rate > 80 ? "high" : r.rate > 50 ? "medium" : "low"}`} style={{ width: `${r.rate}%` }} />
                        <span>{r.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
