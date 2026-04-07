// [CH] Community Hub - Báo cáo module (điều chỉnh)
import React, { useState } from "react";
import { MOCK_MRR_REPORT, MOCK_CHECKIN_REPORT, MOCK_SERVICE_REPORT } from "@/mocks/community-hub/reports";
import { formatCurrency } from "reborn-util";
import "./index.scss";

export default function CHReportsPage() {
  document.title = "Báo cáo Community Hub";
  const [activeTab, setActiveTab] = useState<"mrr" | "members" | "checkin" | "services" | "partners">("mrr");

  return (
    <div className="ch-reports-page">
      <div className="ch-reports-page__header">
        <h2>Báo cáo</h2>
        <div className="tab-switch">
          {([
            ["mrr", "MRR/ARR"],
            ["members", "Thành viên"],
            ["checkin", "Check-in"],
            ["services", "Dịch vụ"],
            ["partners", "Đối tác"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              className={activeTab === key ? "active" : ""}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "mrr" && (
        <div className="ch-reports-page__section">
          {/* MRR Summary */}
          <div className="report-cards">
            <div className="report-card">
              <div className="report-card__label">MRR tháng này</div>
              <div className="report-card__value">
                {formatCurrency(MOCK_MRR_REPORT.current_month.mrr_vnd, ".", "")}đ
              </div>
            </div>
            <div className="report-card">
              <div className="report-card__label">Số thành viên</div>
              <div className="report-card__value">{MOCK_MRR_REPORT.current_month.members}</div>
            </div>
            <div className="report-card">
              <div className="report-card__label">Doanh thu TB/TV</div>
              <div className="report-card__value">
                {formatCurrency(MOCK_MRR_REPORT.current_month.avg_revenue_per_member, ".", "")}đ
              </div>
            </div>
            <div className="report-card accent">
              <div className="report-card__label">Mới tháng này</div>
              <div className="report-card__value">+{MOCK_MRR_REPORT.new_members_this_month}</div>
            </div>
            <div className="report-card danger">
              <div className="report-card__label">Rời tháng này</div>
              <div className="report-card__value">-{MOCK_MRR_REPORT.churn_this_month}</div>
            </div>
          </div>

          {/* MRR History */}
          <div className="report-table-card">
            <h3>Lịch sử MRR</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Tháng</th>
                  <th>MRR</th>
                  <th>Số TV</th>
                  <th>Tăng trưởng</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_MRR_REPORT.history.map((row, i) => {
                  const prevMrr = i > 0 ? MOCK_MRR_REPORT.history[i - 1].mrr : row.mrr;
                  const growth = prevMrr > 0 ? Math.round(((row.mrr - prevMrr) / prevMrr) * 100) : 0;
                  return (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td>{formatCurrency(row.mrr, ".", "")}đ</td>
                      <td>{row.members}</td>
                      <td className={growth > 0 ? "positive" : growth < 0 ? "negative" : ""}>
                        {i === 0 ? "—" : `${growth > 0 ? "+" : ""}${growth}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "checkin" && (
        <div className="ch-reports-page__section">
          <div className="report-cards">
            <div className="report-card">
              <div className="report-card__label">Hôm nay</div>
              <div className="report-card__value">{MOCK_CHECKIN_REPORT.today} lượt</div>
            </div>
            <div className="report-card">
              <div className="report-card__label">Tuần này</div>
              <div className="report-card__value">{MOCK_CHECKIN_REPORT.this_week} lượt</div>
            </div>
            <div className="report-card">
              <div className="report-card__label">Tháng này</div>
              <div className="report-card__value">{MOCK_CHECKIN_REPORT.this_month} lượt</div>
            </div>
          </div>

          <div className="report-table-card">
            <h3>Check-in theo khu vực</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Khu vực</th>
                  <th>Lượt</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CHECKIN_REPORT.by_area.map((row) => (
                  <tr key={row.area}>
                    <td>{row.area}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "services" && (
        <div className="ch-reports-page__section">
          <div className="report-cards">
            <div className="report-card">
              <div className="report-card__label">Tổng lượt sử dụng tháng</div>
              <div className="report-card__value">{MOCK_SERVICE_REPORT.total_usage_this_month}</div>
            </div>
          </div>

          <div className="report-table-card">
            <h3>Chi tiết theo dịch vụ</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Dịch vụ</th>
                  <th>Lượt dùng</th>
                  <th>Doanh thu phát sinh</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SERVICE_REPORT.by_service.map((row) => (
                  <tr key={row.service}>
                    <td>{row.service}</td>
                    <td>{row.usage}</td>
                    <td>{row.revenue > 0 ? formatCurrency(row.revenue, ".", "") + "đ" : "Trong gói"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(activeTab === "members" || activeTab === "partners") && (
        <div className="ch-reports-page__section">
          <div className="coming-soon">
            Đang phát triển...
          </div>
        </div>
      )}
    </div>
  );
}
