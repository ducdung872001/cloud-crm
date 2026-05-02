// [MH] MentorHub - Dashboard (home trang chủ cho mentor)
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext, ContextType } from "contexts/userContext";
import SalesOrderService from "services/SalesOrderService";
import type { IRevenueSummary } from "@/types/order/commissionModel";
import { MOCK_MENTOR, MOCK_KPI, MOCK_NEXT_SESSION, MOCK_COURSES } from "@/mocks/mentorhub";
import "../_shared/styles.scss";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "₫";
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export default function MentorHubDashboardPage() {
  document.title = "MentorHub · Dashboard";
  const ctx = useContext(UserContext) as ContextType;
  const employeeId = ctx?.idEmployee;
  const [summary, setSummary] = useState<IRevenueSummary | null>(null);
  const topCourses = MOCK_COURSES.filter((c) => c.status !== "draft").slice(0, 3);

  const { from, to } = useMemo(() => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 29);
    return { from: isoDate(start), to: isoDate(today) };
  }, []);

  useEffect(() => {
    if (!employeeId) return;
    const ctrl = new AbortController();
    SalesOrderService.revenueSummary(
      { employeeId, type: "COURSE_ENROLLMENT", from, to, groupBy: "day" },
      ctrl.signal,
    )
      .then((res: { result?: IRevenueSummary } | IRevenueSummary) => {
        const result = (res as { result?: IRevenueSummary }).result ?? (res as IRevenueSummary);
        if (result) setSummary(result);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [employeeId, from, to]);

  const series = summary?.series ?? [];
  const totalRevenue = summary?.totalRevenue ?? MOCK_KPI.revenueMonth;
  const trend = summary?.trend ?? MOCK_KPI.revenueTrend;

  return (
    <div className="mh">
      <div className="mh__hero">
        <div className="mh__kicker">CHÀO {MOCK_MENTOR.name.split(" ").pop()} 👋</div>
        <h1>Tổng quan <em>tháng này</em>.</h1>
        <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>
          Buổi học kế tiếp: <strong>{MOCK_NEXT_SESSION.courseName}</strong> · Buổi {MOCK_NEXT_SESSION.sessionNumber}
        </p>
      </div>

      <div className="mh__grid mh__grid--4" style={{ marginBottom: 32 }}>
        <div className="mh__kpi">
          <div className="mh__kpi-label">DOANH THU 30 NGÀY</div>
          <div className="mh__kpi-value">{formatVND(totalRevenue)}</div>
          <div className="mh__kpi-delta">{trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}% vs kỳ trước</div>
        </div>
        <div className="mh__kpi">
          <div className="mh__kpi-label">HỌC VIÊN ĐĂNG KÝ</div>
          <div className="mh__kpi-value">{MOCK_KPI.transactions}</div>
          <div className="mh__kpi-delta">{MOCK_KPI.activeStudents} đang theo học</div>
        </div>
        <div className="mh__kpi">
          <div className="mh__kpi-label">NPS</div>
          <div className="mh__kpi-value">{MOCK_KPI.npsScore}<span style={{ fontSize: 18, color: "var(--mh-ink-soft)" }}>/5</span></div>
          <div className="mh__kpi-delta">{MOCK_KPI.npsTotal} đánh giá</div>
        </div>
        <div className="mh__kpi">
          <div className="mh__kpi-label">HỖ TRỢ MỞ</div>
          <div className="mh__kpi-value" style={{ color: "var(--mh-red)" }}>{MOCK_KPI.openTickets}</div>
          <div className="mh__kpi-delta mh__kpi-delta--down">2 quá SLA</div>
        </div>
      </div>

      <div className="mh__card mh__card--dark" style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
        <div>
          <div className="mh__kicker" style={{ color: "rgba(253, 230, 138, 0.8)" }}>🔴 BUỔI HỌC TIẾP THEO</div>
          <h3 style={{ color: "#fff", marginBottom: 6 }}>{MOCK_NEXT_SESSION.courseName}</h3>
          <div style={{ opacity: .8, fontFamily: "'Geist Mono', monospace", fontSize: 13 }}>
            Buổi {MOCK_NEXT_SESSION.sessionNumber} · {MOCK_NEXT_SESSION.sessionTitle} · {MOCK_NEXT_SESSION.registered}/{MOCK_NEXT_SESSION.capacity} học viên
          </div>
        </div>
        <Link to="/mh/live-session" className="mh__btn mh__btn--amber">Mở phòng live →</Link>
      </div>

      <div className="mh__grid mh__grid--2" style={{ gap: 24, marginBottom: 32 }}>
        <div className="mh__card">
          <h3 style={{ marginBottom: 20 }}>Doanh thu 30 ngày</h3>
          {series.length === 0 ? (
            <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mh-ink-soft)", fontSize: 13 }}>
              {summary === null ? "Đang tải…" : "Chưa có giao dịch trong 30 ngày qua"}
            </div>
          ) : (
            <svg viewBox="0 0 300 100" style={{ width: "100%", height: 160 }} preserveAspectRatio="none">
              {(() => {
                const max = Math.max(1, ...series.map((p) => p.revenue));
                const points = series.map((p, i) => `${(i / Math.max(1, series.length - 1)) * 300},${100 - (p.revenue / max) * 90}`).join(" ");
                return (
                  <>
                    <polyline fill="rgba(15, 118, 110, 0.1)" stroke="none" points={`0,100 ${points} 300,100`} />
                    <polyline fill="none" stroke="#0F766E" strokeWidth="2" points={points} />
                  </>
                );
              })()}
            </svg>
          )}
        </div>

        <div className="mh__card mh__ai-card">
          <h4 className="mh__mono" style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: ".08em" }}>GỢI Ý AI</h4>
          <h3 style={{ margin: "8px 0 16px" }}>Cross-sell tiềm năng</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <li style={{ fontSize: 14 }}>
              <strong>12 học viên</strong> khoá Microservices có thể quan tâm <em>Event-Driven Architecture</em>. Match 87%.
            </li>
            <li style={{ fontSize: 14 }}>
              <strong>Phạm Thu Hà</strong> (TPBank) đã hoàn thành 3 khoá. Đề xuất <em>Leadership cho Engineering Managers</em>. Match 92%.
            </li>
          </ul>
        </div>
      </div>

      <div className="mh__card">
        <h3 style={{ marginBottom: 16 }}>Top khoá học</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {topCourses.map((c) => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 16, alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--mh-line)" }}>
              <div className="mh__avatar mh__avatar--lg" style={{ background: c.iconBg, fontSize: 24 }}>{c.icon}</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: "var(--mh-ink-soft)" }} className="mh__mono">{c.registered}/{c.capacity} · NPS {c.nps}</div>
              </div>
              <div className="mh__mono" style={{ fontSize: 14, color: "var(--mh-teal)" }}>{formatVND(c.revenue)}</div>
              <span className={`mh__pill mh__pill--${c.status}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
