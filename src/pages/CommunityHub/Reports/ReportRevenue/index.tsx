import React from "react";
import { MOCK_MRR_REPORT } from "@/mocks/community-hub/reports";
import { formatCurrency } from "reborn-util";
import "../index.scss";
import ReportHeader from "../ReportHeader";
import ReportSignature from "../ReportSignature";

export default function ReportRevenue() {
  document.title = "Báo cáo Doanh thu & MRR";
  const f = (v: number) => formatCurrency(v, ".", "");

  // ── Phase 1.4 — Mix Physical vs Digital&Nutrition theo mô hình Phygital 20/80 ──
  // Physical = phí tập (membership_fee); Digital&Nutrition = dịch vụ ngoài gói + khóa học (proxies cho dinh dưỡng + nội dung số).
  const physicalRevenue = MOCK_MRR_REPORT.revenue_breakdown.membership_fee;
  const digitalRevenue = MOCK_MRR_REPORT.revenue_breakdown.extra_services + MOCK_MRR_REPORT.revenue_breakdown.courses_paid;
  const totalRevenue = physicalRevenue + digitalRevenue;
  const physicalPct = totalRevenue > 0 ? Math.round((physicalRevenue / totalRevenue) * 1000) / 10 : 0;
  const digitalPct = totalRevenue > 0 ? 100 - physicalPct : 0;
  // Target Phygital = 20% Physical / 80% Digital. Cảnh báo nếu |physical - 20| > 15 điểm %.
  const mixDeviation = Math.abs(physicalPct - 20);
  const mixStatus: "on_target" | "warn" | "off" =
    mixDeviation <= 10 ? "on_target" : mixDeviation <= 25 ? "warn" : "off";
  const mixMessage =
    mixStatus === "on_target"
      ? "✅ Đạt mô hình Phygital 20/80 — dòng tiền bền vững"
      : mixStatus === "warn"
      ? "⚠️ Đang lệch mức target — cần thúc đẩy doanh thu digital/dinh dưỡng"
      : "🚨 Lệch xa target — cơ cấu doanh thu chưa chuyển đổi Phygital. Tham khảo [URD Part 15 §3-UR-FITPRO-03]";
  const mixColor = mixStatus === "on_target" ? "#00C9A7" : mixStatus === "warn" ? "#F59E0B" : "#E85D4B";

  return (
    <div className="ch-reports-page">
      <ReportHeader title="Doanh thu & MRR" />
      <div className="ch-reports-page__section">
        {/* ── Phygital Revenue Mix card ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: `2px solid ${mixColor}`,
            padding: "18px 22px",
            marginBottom: 18,
            boxShadow: "0 4px 16px rgba(11,46,42,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6B8A85", letterSpacing: 0.4, textTransform: "uppercase" }}>
                Cơ cấu Phygital — Target 20% Physical / 80% Digital & Nutrition
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0B2E2A", marginTop: 4 }}>
                {physicalPct}% Physical · {digitalPct}% Digital & Nutrition
              </div>
              <div style={{ fontSize: 13, color: mixColor, fontWeight: 600, marginTop: 6 }}>
                {mixMessage}
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#6B8A85", textAlign: "right", minWidth: 180 }}>
              Physical: <strong>{f(physicalRevenue)}đ</strong><br />
              Digital & Nutrition: <strong>{f(digitalRevenue)}đ</strong><br />
              Tổng: <strong>{f(totalRevenue)}đ</strong>
            </div>
          </div>
          {/* Stacked bar */}
          <div style={{ marginTop: 14, height: 14, background: "#F3F4F6", borderRadius: 999, overflow: "hidden", display: "flex" }}>
            <div
              style={{
                width: `${physicalPct}%`,
                background: "#E85D4B",
                transition: "width .3s",
              }}
              title={`Physical ${physicalPct}%`}
            />
            <div
              style={{
                width: `${digitalPct}%`,
                background: "#00C9A7",
                transition: "width .3s",
              }}
              title={`Digital & Nutrition ${digitalPct}%`}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#6B8A85" }}>
            <span>🏋️ Physical (phí tập)</span>
            <span>Target: 20% / 80%</span>
            <span>💊 Digital & Nutrition</span>
          </div>
        </div>

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
      <ReportSignature />
    </div>
  );
}
