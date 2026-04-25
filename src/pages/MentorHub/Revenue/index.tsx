// [MH] Revenue — dashboard tài chính
import React from "react";
import { MOCK_COURSES, MOCK_REVENUE_30D, MOCK_KPI } from "@/mocks/mentorhub";
import "../_shared/styles.scss";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

export default function MHRevenue() {
  document.title = "Doanh thu · MentorHub";
  const earning = MOCK_COURSES.filter((c) => c.revenue > 0);
  const totalRevenue = earning.reduce((s, c) => s + c.revenue, 0);
  const totalStudents = earning.reduce((s, c) => s + c.registered, 0);
  const max = Math.max(...MOCK_REVENUE_30D);

  return (
    <div className="mh">
      <div className="mh__hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mh__kicker">TÀI CHÍNH</div>
          <h1>Doanh <em>thu</em></h1>
          <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>Tháng này: {formatVND(MOCK_KPI.revenueMonth)} · Payout kế tiếp 30/04</p>
        </div>
        <button className="mh__btn mh__btn--primary">📊 Xuất báo cáo</button>
      </div>

      <div className="mh__grid mh__grid--4" style={{ marginBottom: 32 }}>
        <div className="mh__kpi"><div className="mh__kpi-label">DT THÁNG</div><div className="mh__kpi-value">{formatVND(MOCK_KPI.revenueMonth)}</div><div className="mh__kpi-delta">↑ {MOCK_KPI.revenueTrend}%</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">TỔNG DT</div><div className="mh__kpi-value">{formatVND(totalRevenue)}</div><div className="mh__kpi-delta">{earning.length} khoá</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">HV ĐÃ TRẢ</div><div className="mh__kpi-value">{totalStudents}</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">PAYOUT KẾ</div><div className="mh__kpi-value" style={{ color: "var(--mh-teal)" }}>{formatVND(Math.round(MOCK_KPI.revenueMonth * 0.85))}</div><div className="mh__kpi-delta">30/04 · sau 15% phí</div></div>
      </div>

      <div className="mh__card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Doanh thu 30 ngày</h3>
        <svg viewBox="0 0 300 100" style={{ width: "100%", height: 180 }} preserveAspectRatio="none">
          {(() => {
            const points = MOCK_REVENUE_30D.map((v, i) => `${(i / (MOCK_REVENUE_30D.length - 1)) * 300},${100 - (v / max) * 90}`).join(" ");
            return (<><polyline fill="rgba(15, 118, 110, 0.12)" stroke="none" points={`0,100 ${points} 300,100`} /><polyline fill="none" stroke="#0F766E" strokeWidth="2" points={points} /></>);
          })()}
        </svg>
      </div>

      <div className="mh__card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Chi tiết theo khoá</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="mh__table">
            <thead>
              <tr>
                <th>Khoá học</th>
                <th style={{ textAlign: "right" }}>Giá</th>
                <th style={{ textAlign: "right" }}>Đăng ký</th>
                <th style={{ textAlign: "right" }}>DT gross</th>
                <th style={{ textAlign: "right" }}>Phí 15%</th>
                <th style={{ textAlign: "right" }}>Net payout</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_COURSES.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="mh__avatar" style={{ background: c.iconBg, fontSize: 14 }}>{c.icon}</div>
                      <span style={{ fontWeight: 500 }}>{c.title}</span>
                    </div>
                  </td>
                  <td className="mh__mono" style={{ textAlign: "right" }}>{formatVND(c.price)}</td>
                  <td className="mh__mono" style={{ textAlign: "right" }}>{c.registered}</td>
                  <td className="mh__mono" style={{ textAlign: "right", color: "var(--mh-teal)", fontWeight: 600 }}>{formatVND(c.revenue)}</td>
                  <td className="mh__mono" style={{ textAlign: "right", color: "var(--mh-red)" }}>−{formatVND(Math.round(c.revenue * 0.15))}</td>
                  <td className="mh__mono" style={{ textAlign: "right", fontWeight: 600 }}>{formatVND(Math.round(c.revenue * 0.85))}</td>
                  <td><span className={"mh__pill mh__pill--" + c.status}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mh__grid mh__grid--2">
        <div className="mh__card">
          <h3 style={{ marginBottom: 16 }}>Phương thức thanh toán</h3>
          {[{ method: "VNPay QR", amount: 28400000, pct: 59 }, { method: "Chuyển khoản", amount: 12800000, pct: 27 }, { method: "Thẻ tín dụng", amount: 4800000, pct: 10 }, { method: "Momo", amount: 2200000, pct: 4 }].map((p) => (
            <div key={p.method} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--mh-line)" }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{p.method}</div>
                <div style={{ height: 4, background: "var(--mh-ivory-2)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                  <div style={{ width: p.pct + "%", height: "100%", background: "var(--mh-teal)" }} />
                </div>
              </div>
              <div className="mh__mono" style={{ fontSize: 13, fontWeight: 600 }}>{formatVND(p.amount)}</div>
            </div>
          ))}
        </div>
        <div className="mh__card">
          <h3 style={{ marginBottom: 16 }}>Giao dịch gần đây</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[{ name: "Trần Văn Đức", course: "Microservices", amount: 2400000, time: "2h trước" }, { name: "Phạm Thu Hà", course: "Leadership", amount: 4200000, time: "5h trước" }, { name: "Vũ Hoàng Nam", course: "Microservices", amount: 2400000, time: "1d trước" }, { name: "Nguyễn Hoàng Anh", course: "System Design", amount: 3500000, time: "1d trước" }].map((tx, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, paddingBottom: 12, borderBottom: "1px solid var(--mh-line)" }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{tx.name}</div>
                  <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{tx.course} · {tx.time}</div>
                </div>
                <div className="mh__mono" style={{ fontSize: 14, color: "var(--mh-teal)", fontWeight: 600 }}>+{formatVND(tx.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
