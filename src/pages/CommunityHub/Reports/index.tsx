// [CH] Community Hub - Báo cáo (thiết kế theo insight ngành co-living)
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MOCK_MRR_REPORT, MOCK_MEMBER_REPORT, MOCK_CHECKIN_REPORT,
  MOCK_SERVICE_REPORT, MOCK_PARTNER_REPORT, MOCK_FINANCE_REPORT,
} from "@/mocks/community-hub/reports";
import { formatCurrency } from "reborn-util";
import "./index.scss";

type Tab = "mrr" | "members" | "checkin" | "services" | "partners" | "finance";
const VALID_TABS: Tab[] = ["mrr", "members", "checkin", "services", "partners", "finance"];

export default function CHReportsPage() {
  document.title = "Báo cáo Community Hub";
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>("mrr");

  // Đọc tab từ URL ?tab=xxx khi navigate từ submenu
  useEffect(() => {
    const t = searchParams.get("tab") as Tab;
    if (t && VALID_TABS.includes(t)) setTab(t);
  }, [searchParams]);

  const f = (v: number) => formatCurrency(v, ".", "");

  const TABS: { key: Tab; label: string }[] = [
    { key: "mrr", label: "Doanh thu & MRR" },
    { key: "members", label: "Thành viên" },
    { key: "checkin", label: "Check-in" },
    { key: "services", label: "Dịch vụ" },
    { key: "partners", label: "Đối tác" },
    { key: "finance", label: "Tài chính" },
  ];

  return (
    <div className="ch-reports-page">
      <div className="ch-reports-page__header">
        <h2>Báo cáo</h2>
        <div className="tab-switch">
          {TABS.map((t) => (
            <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ DOANH THU & MRR ═══ */}
      {tab === "mrr" && (
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
      )}

      {/* ═══ THÀNH VIÊN ═══ */}
      {tab === "members" && (
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
                <tbody>
                  {MOCK_MEMBER_REPORT.by_plan.map((row) => (
                    <tr key={row.plan}><td>{row.plan}</td><td>{row.count}</td><td>{row.pct}%</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="report-table-card">
              <h3>Phân bổ theo loại</h3>
              <table className="report-table">
                <thead><tr><th>Loại</th><th>Số TV</th></tr></thead>
                <tbody>
                  {MOCK_MEMBER_REPORT.by_type.map((row) => (
                    <tr key={row.type}><td>{row.type}</td><td>{row.count}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="report-table-card">
              <h3>Top giới thiệu</h3>
              <table className="report-table">
                <thead><tr><th>Thành viên</th><th>Giới thiệu</th></tr></thead>
                <tbody>
                  {MOCK_MEMBER_REPORT.top_referrers.map((row) => (
                    <tr key={row.name}><td>{row.name}</td><td className="accent">{row.referrals} TV</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="report-insight">
            <strong>Insight:</strong> Thời gian ở lại trung bình <strong>{MOCK_MEMBER_REPORT.avg_stay_months} tháng</strong>.
            {MOCK_MEMBER_REPORT.expiring_7_days} thành viên sắp hết hạn trong 7 ngày — cần liên hệ gia hạn.
          </div>
        </div>
      )}

      {/* ═══ CHECK-IN ═══ */}
      {tab === "checkin" && (
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
                <tbody>
                  {MOCK_CHECKIN_REPORT.by_area.map((row) => (
                    <tr key={row.area}><td>{row.area}</td><td>{row.count}</td><td>{row.pct}%</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="report-table-card">
              <h3>Tỷ lệ lấp đầy (Occupancy)</h3>
              <table className="report-table">
                <thead><tr><th>Khu vực</th><th>Occupancy</th></tr></thead>
                <tbody>
                  {MOCK_CHECKIN_REPORT.occupancy_rate.map((row) => (
                    <tr key={row.area}>
                      <td>{row.area}</td>
                      <td>
                        <div className="occupancy-bar">
                          <div className={`occupancy-fill ${row.rate > 80 ? "high" : row.rate > 50 ? "medium" : "low"}`} style={{ width: `${row.rate}%` }} />
                          <span>{row.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DỊCH VỤ ═══ */}
      {tab === "services" && (
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
                {MOCK_SERVICE_REPORT.by_service.map((row) => (
                  <tr key={row.service}>
                    <td>{row.service}</td><td>{row.usage}</td><td>{row.avg_per_member}</td>
                    <td>{row.revenue > 0 ? f(row.revenue) + "đ" : "—"}</td>
                    <td><span className={`tag ${row.in_plan ? "in-plan" : "extra"}`}>{row.in_plan ? "Trong gói" : "Ngoài gói"}</span></td>
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
                  {MOCK_SERVICE_REPORT.upsell_opportunities.map((row) => (
                    <tr key={row.service}><td>{row.service}</td><td className="accent">{row.members}</td><td>{row.reason}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ ĐỐI TÁC ═══ */}
      {tab === "partners" && (
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
                  {MOCK_PARTNER_REPORT.by_partner.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td><td><span className={`tag role-${row.role.toLowerCase()}`}>{row.role}</span></td>
                      <td className="accent">{f(row.commission)}đ</td><td>{row.referrals}</td><td>{row.courses}</td><td>{row.students}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="report-table-card">
              <h3>Hoa hồng theo tháng</h3>
              <table className="report-table">
                <thead><tr><th>Tháng</th><th>Tổng hoa hồng</th></tr></thead>
                <tbody>
                  {MOCK_PARTNER_REPORT.commission_trend.map((row) => (
                    <tr key={row.month}><td>{row.month}</td><td>{f(row.amount)}đ</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TÀI CHÍNH & CÔNG NỢ ═══ */}
      {tab === "finance" && (
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
                <tbody>
                  {MOCK_FINANCE_REPORT.revenue_by_source.map((row) => (
                    <tr key={row.source}><td>{row.source}</td><td>{f(row.amount)}đ</td><td>{row.pct}%</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="report-table-card">
              <h3>Cơ cấu chi phí</h3>
              <table className="report-table">
                <thead><tr><th>Khoản mục</th><th>Số tiền</th><th>Tỷ trọng</th></tr></thead>
                <tbody>
                  {MOCK_FINANCE_REPORT.expense_by_category.map((row) => (
                    <tr key={row.category}><td>{row.category}</td><td>{f(row.amount)}đ</td><td>{row.pct}%</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="report-table-card">
            <h3>Xu hướng Doanh thu — Chi phí — Lợi nhuận</h3>
            <table className="report-table">
              <thead><tr><th>Tháng</th><th>Doanh thu</th><th>Chi phí</th><th>Lợi nhuận</th><th>Margin</th></tr></thead>
              <tbody>
                {MOCK_FINANCE_REPORT.monthly_trend.map((row) => {
                  const margin = row.revenue > 0 ? Math.round((row.profit / row.revenue) * 100) : 0;
                  return (
                    <tr key={row.month}>
                      <td>{row.month}</td><td>{f(row.revenue)}đ</td><td>{f(row.expense)}đ</td>
                      <td className="positive">{f(row.profit)}đ</td><td>{margin}%</td>
                    </tr>
                  );
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
      )}
    </div>
  );
}
