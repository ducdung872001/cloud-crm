import React, { useContext, useEffect, useMemo, useState } from "react";
import { UserContext, ContextType } from "contexts/userContext";
import SalesOrderService from "services/SalesOrderService";
import type { IRevenueSummary } from "@/types/order/commissionModel";
import { MOCK_COURSES, MOCK_KPI } from "@/mocks/mentorhub";
import "../_shared/styles.scss";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "₫";

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export default function MHRevenue() {
  document.title = "Doanh thu · MentorHub";
  const ctx = useContext(UserContext) as ContextType;
  const employeeId = ctx?.idEmployee;

  const [summary, setSummary] = useState<IRevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { from, to } = useMemo(() => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 29);
    return { from: isoDate(start), to: isoDate(today) };
  }, []);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    SalesOrderService.revenueSummary(
      { employeeId, type: "COURSE_ENROLLMENT", from, to, groupBy: "day" },
      ctrl.signal,
    )
      .then((res: { code?: number; result?: IRevenueSummary } | IRevenueSummary) => {
        const result = (res as { result?: IRevenueSummary }).result ?? (res as IRevenueSummary);
        setSummary(result ?? null);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message || "Không tải được dữ liệu doanh thu");
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [employeeId, from, to]);

  const series = summary?.series ?? [];
  const totalRevenue = summary?.totalRevenue ?? 0;
  const trend = summary?.trend ?? 0;
  const max = Math.max(1, ...series.map((p) => p.revenue));
  const byCourseRows = summary?.byCourse ?? [];

  const earningMock = MOCK_COURSES.filter((c) => c.revenue > 0);
  const totalStudentsMock = earningMock.reduce((s, c) => s + c.registered, 0);

  return (
    <div className="mh">
      <div className="mh__hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mh__kicker">TÀI CHÍNH</div>
          <h1>Doanh <em>thu</em></h1>
          <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>
            30 ngày qua: {loading ? "đang tải…" : formatVND(totalRevenue)} · Payout kế tiếp 30/04
          </p>
        </div>
        <button className="mh__btn mh__btn--primary">📊 Xuất báo cáo</button>
      </div>

      {error && (
        <div className="mh__card" style={{ marginBottom: 16, color: "var(--mh-red)", borderColor: "var(--mh-red)" }}>
          ⚠ {error}
        </div>
      )}

      <div className="mh__grid mh__grid--4" style={{ marginBottom: 32 }}>
        <div className="mh__kpi">
          <div className="mh__kpi-label">DT 30 NGÀY</div>
          <div className="mh__kpi-value">{loading ? "…" : formatVND(totalRevenue)}</div>
          <div className="mh__kpi-delta">{trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%</div>
        </div>
        <div className="mh__kpi">
          <div className="mh__kpi-label">SỐ KHOÁ CÓ DT</div>
          <div className="mh__kpi-value">{byCourseRows.length || earningMock.length}</div>
          <div className="mh__kpi-delta">{byCourseRows.reduce((s, b) => s + b.orderCount, 0) || MOCK_KPI.transactions} đơn</div>
        </div>
        <div className="mh__kpi"><div className="mh__kpi-label">HV ĐÃ TRẢ</div><div className="mh__kpi-value">{totalStudentsMock}</div></div>
        <div className="mh__kpi">
          <div className="mh__kpi-label">PAYOUT KẾ</div>
          <div className="mh__kpi-value" style={{ color: "var(--mh-teal)" }}>{formatVND(Math.round(totalRevenue * 0.7))}</div>
          <div className="mh__kpi-delta">30/04 · sau 30% phí</div>
        </div>
      </div>

      <div className="mh__card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Doanh thu 30 ngày</h3>
        {loading ? (
          <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mh-ink-soft)" }}>Đang tải…</div>
        ) : series.length === 0 ? (
          <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mh-ink-soft)" }}>Chưa có giao dịch nào trong 30 ngày qua.</div>
        ) : (
          <svg viewBox="0 0 300 100" style={{ width: "100%", height: 180 }} preserveAspectRatio="none">
            {(() => {
              const points = series
                .map((p, i) => `${(i / Math.max(1, series.length - 1)) * 300},${100 - (p.revenue / max) * 90}`)
                .join(" ");
              return (
                <>
                  <polyline fill="rgba(15, 118, 110, 0.12)" stroke="none" points={`0,100 ${points} 300,100`} />
                  <polyline fill="none" stroke="#0F766E" strokeWidth="2" points={points} />
                </>
              );
            })()}
          </svg>
        )}
      </div>

      <div className="mh__card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Chi tiết theo khoá</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="mh__table">
            <thead>
              <tr>
                <th>Khoá học (courseId)</th>
                <th style={{ textAlign: "right" }}>Đơn</th>
                <th style={{ textAlign: "right" }}>DT gross</th>
                <th style={{ textAlign: "right" }}>Phí 30%</th>
                <th style={{ textAlign: "right" }}>Net payout</th>
              </tr>
            </thead>
            <tbody>
              {byCourseRows.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--mh-ink-soft)", padding: 24 }}>{loading ? "Đang tải…" : "Chưa có dữ liệu byCourse"}</td></tr>
              ) : byCourseRows.map((c) => (
                <tr key={`${c.objectType}-${c.courseId}`}>
                  <td><span style={{ fontWeight: 500 }} className="mh__mono">{c.objectType}#{c.courseId}</span></td>
                  <td className="mh__mono" style={{ textAlign: "right" }}>{c.orderCount}</td>
                  <td className="mh__mono" style={{ textAlign: "right", color: "var(--mh-teal)", fontWeight: 600 }}>{formatVND(c.revenue)}</td>
                  <td className="mh__mono" style={{ textAlign: "right", color: "var(--mh-red)" }}>−{formatVND(c.revenue * 0.3)}</td>
                  <td className="mh__mono" style={{ textAlign: "right", fontWeight: 600 }}>{formatVND(c.revenue * 0.7)}</td>
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
