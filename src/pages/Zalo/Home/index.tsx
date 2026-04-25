// Zalo Mini App · Home — KPI compact + buổi kế tiếp + quick actions
import React from "react";
import { Link } from "react-router-dom";
import ZaloMiniLayout from "../_shared/ZaloMiniLayout";
import { zmp } from "../_shared/zmpSdk";
import { MOCK_MENTOR, MOCK_KPI, MOCK_NEXT_SESSION, MOCK_COURSES } from "@/mocks/mentorhub";

const formatVNDCompact = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : new Intl.NumberFormat("vi-VN").format(n);

export default function ZaloHome() {
  document.title = "MentorHub · Home";
  const topCourse = MOCK_COURSES.find((c) => c.status === "live") ?? MOCK_COURSES[0];

  const handleShare = () => {
    zmp.openShareSheet({
      type: "zmp",
      data: {
        title: "MentorHub — Học trực tiếp với chuyên gia",
        description: "Khoá học 1:1 với mentor tại Grab, Shopee, TPBank, VNG...",
        path: "/crm/portal",
      },
    });
  };

  return (
    <ZaloMiniLayout title={`Chào ${MOCK_MENTOR.name.split(" ").pop()}!`}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div className="zmp-kpi">
          <div className="zmp-kpi__label">DOANH THU THÁNG</div>
          <div className="zmp-kpi__value">{formatVNDCompact(MOCK_KPI.revenueMonth)}₫</div>
          <div className="zmp-kpi__delta">↑ {MOCK_KPI.revenueTrend}%</div>
        </div>
        <div className="zmp-kpi">
          <div className="zmp-kpi__label">NPS</div>
          <div className="zmp-kpi__value">{MOCK_KPI.npsScore}<span style={{ fontSize: 14, color: "var(--zmp-ink-soft)" }}>/5</span></div>
          <div className="zmp-kpi__delta">{MOCK_KPI.npsTotal} đánh giá</div>
        </div>
        <div className="zmp-kpi">
          <div className="zmp-kpi__label">HỌC VIÊN</div>
          <div className="zmp-kpi__value">{MOCK_KPI.activeStudents.toLocaleString()}</div>
          <div className="zmp-kpi__delta">+12 tuần này</div>
        </div>
        <div className="zmp-kpi">
          <div className="zmp-kpi__label">TICKET MỞ</div>
          <div className="zmp-kpi__value" style={{ color: MOCK_KPI.openTickets > 3 ? "var(--zmp-red)" : "inherit" }}>{MOCK_KPI.openTickets}</div>
          <div className="zmp-kpi__delta" style={{ color: "var(--zmp-red)" }}>2 quá SLA</div>
        </div>
      </div>

      {/* Next session card — highlighted */}
      <div className="zmp-card" style={{ background: "linear-gradient(135deg, #134E4A, #0F766E)", color: "#fff", border: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FCA5A5", animation: "pulse 1.5s infinite" }}></span>
          <span className="zmp-kicker" style={{ color: "rgba(253, 230, 138, 0.9)" }}>BUỔI KẾ TIẾP · 30 PHÚT NỮA</span>
        </div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, lineHeight: 1.3, marginBottom: 8 }}>{MOCK_NEXT_SESSION.courseName}</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }} className="zmp-mono">
          Buổi {MOCK_NEXT_SESSION.sessionNumber} · {MOCK_NEXT_SESSION.registered}/{MOCK_NEXT_SESSION.capacity} HV
        </div>
        <button
          className="zmp-btn zmp-btn--amber zmp-btn--full"
          onClick={() => zmp.openUrl(`https://zoom.us/j/${MOCK_NEXT_SESSION.zoomId.replace(/-/g, "")}`)}
        >
          🎥 Mở phòng Zoom →
        </button>
      </div>

      {/* Quick actions grid */}
      <div className="zmp-kicker" style={{ margin: "16px 0 8px" }}>THAO TÁC NHANH</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <Link to="/zalo/today" className="zmp-btn" style={{ flexDirection: "column", padding: 14, gap: 4 }}>
          <span style={{ fontSize: 22 }}>▦</span>
          <span style={{ fontSize: 12 }}>Xem lịch hôm nay</span>
        </Link>
        <Link to="/zalo/tickets" className="zmp-btn" style={{ flexDirection: "column", padding: 14, gap: 4 }}>
          <span style={{ fontSize: 22 }}>✉</span>
          <span style={{ fontSize: 12 }}>Trả lời {MOCK_KPI.openTickets} ticket</span>
        </Link>
        <button className="zmp-btn" style={{ flexDirection: "column", padding: 14, gap: 4 }} onClick={handleShare}>
          <span style={{ fontSize: 22 }}>↗</span>
          <span style={{ fontSize: 12 }}>Chia sẻ khoá</span>
        </button>
        <Link to="/zalo/students" className="zmp-btn" style={{ flexDirection: "column", padding: 14, gap: 4 }}>
          <span style={{ fontSize: 22 }}>☉</span>
          <span style={{ fontSize: 12 }}>Nhắn học viên</span>
        </Link>
      </div>

      {/* Top course */}
      <div className="zmp-kicker" style={{ marginBottom: 8 }}>KHOÁ HOT NHẤT</div>
      <div className="zmp-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: topCourse.iconBg, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "#fff", fontFamily: "'Fraunces', serif" }}>
          {topCourse.icon}
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, lineHeight: 1.3, marginBottom: 6 }}>{topCourse.title}</div>
          <div className="zmp-mono" style={{ fontSize: 11, color: "var(--zmp-ink-soft)", marginBottom: 10 }}>
            {topCourse.registered}/{topCourse.capacity} HV · NPS {topCourse.nps} · {formatVNDCompact(topCourse.revenue)}₫ DT
          </div>
          <button className="zmp-btn zmp-btn--zalo zmp-btn--full" onClick={handleShare}>💬 Chia sẻ vào Zalo</button>
        </div>
      </div>

      {/* Deep link to web for power work */}
      <div className="zmp-card" style={{ marginTop: 16, textAlign: "center", background: "#FEF9C3", borderColor: "#FCD34D" }}>
        <div style={{ fontSize: 12, color: "var(--zmp-ink-soft)", marginBottom: 8 }}>Cần tạo khoá mới hoặc xem báo cáo chi tiết?</div>
        <button
          className="zmp-btn"
          onClick={() => zmp.openUrl("http://localhost:4000/crm/mh/dashboard")}
          style={{ fontSize: 13 }}
        >
          💻 Mở MentorHub trên máy tính →
        </button>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </ZaloMiniLayout>
  );
}
