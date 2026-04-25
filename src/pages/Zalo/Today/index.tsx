// Zalo Mini App · Hôm nay — lịch sessions + join Zoom 1-tap
import React from "react";
import ZaloMiniLayout from "../_shared/ZaloMiniLayout";
import { zmp } from "../_shared/zmpSdk";
import { MOCK_NEXT_SESSION, MOCK_COURSES } from "@/mocks/mentorhub";

export default function ZaloToday() {
  document.title = "MentorHub · Hôm nay";
  const today = new Date();
  const todayStr = today.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" });

  // Mock today's sessions
  const sessions = [
    { id: "S1", time: "10:00", duration: 120, course: "Microservices", courseIcon: "⎈", color: "#0F766E", students: 23, capacity: 30, zoomId: MOCK_NEXT_SESSION.zoomId, status: "done" as const },
    { id: "S2", time: "20:00", duration: 120, course: "Service Discovery & Load Balancing", courseIcon: "⎈", color: "#0F766E", students: 23, capacity: 30, zoomId: MOCK_NEXT_SESSION.zoomId, status: "upcoming" as const },
    { id: "S3", time: "21:30", duration: 60, course: "Event-Driven Architecture · Q&A", courseIcon: "⚡", color: "#B45309", students: 18, capacity: 25, zoomId: MOCK_NEXT_SESSION.zoomId, status: "upcoming" as const },
  ];

  // Upcoming 3 days
  const upcoming = [
    { date: "Mai", label: "Thứ 5, 25/04", sessions: 2 },
    { date: "26/04", label: "Thứ 6", sessions: 1 },
    { date: "27/04", label: "Thứ 7", sessions: 0 },
  ];

  return (
    <ZaloMiniLayout title="Hôm nay">
      <div className="zmp-kicker" style={{ marginBottom: 8, textTransform: "capitalize" }}>{todayStr}</div>

      {sessions.map((s) => (
        <div key={s.id} className="zmp-card" style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, padding: 14, alignItems: "center" }}>
            {/* Time */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, lineHeight: 1, color: s.status === "done" ? "var(--zmp-ink-soft)" : "var(--zmp-teal)" }}>{s.time}</div>
              <div className="zmp-mono" style={{ fontSize: 9, color: "var(--zmp-ink-soft)", marginTop: 2 }}>{s.duration}ph</div>
            </div>
            {/* Course info */}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14 }}>{s.courseIcon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>{s.course}</span>
              </div>
              <div className="zmp-mono" style={{ fontSize: 11, color: "var(--zmp-ink-soft)" }}>{s.students}/{s.capacity} HV</div>
            </div>
            {/* Status pill */}
            <span className={"zmp-pill " + (s.status === "done" ? "zmp-pill--green" : "zmp-pill--upcoming")}>
              {s.status === "done" ? "✓ Xong" : "Sắp bắt đầu"}
            </span>
          </div>

          {s.status === "upcoming" && (
            <div style={{ padding: "0 14px 14px", display: "flex", gap: 8 }}>
              <button
                className="zmp-btn zmp-btn--primary"
                style={{ flex: 1 }}
                onClick={() => zmp.openUrl(`https://zoom.us/j/${s.zoomId.replace(/-/g, "")}`)}
              >
                🎥 Mở Zoom
              </button>
              <button className="zmp-btn" style={{ flex: 1 }}>📧 Nhắc HV</button>
            </div>
          )}
          {s.status === "done" && (
            <div style={{ padding: "0 14px 14px" }}>
              <button
                className="zmp-btn zmp-btn--full"
                onClick={() => zmp.openUrl("http://localhost:4000/crm/mh/session-review")}
              >
                ✦ Xem AI ghi chú
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Upcoming days */}
      <div className="zmp-kicker" style={{ margin: "24px 0 8px" }}>SẮP TỚI</div>
      <div className="zmp-card" style={{ padding: 0 }}>
        {upcoming.map((u, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, padding: 14, borderBottom: i < upcoming.length - 1 ? "1px solid var(--zmp-line)" : 0, alignItems: "center" }}>
            <div className="zmp-mono" style={{ fontSize: 13, color: "var(--zmp-teal)", fontWeight: 600, minWidth: 56 }}>{u.date}</div>
            <div className="zmp-mono" style={{ fontSize: 11, color: "var(--zmp-ink-soft)" }}>{u.label}</div>
            <span className="zmp-mono" style={{ fontSize: 11, color: u.sessions > 0 ? "var(--zmp-ink)" : "var(--zmp-ink-soft)" }}>
              {u.sessions > 0 ? `${u.sessions} buổi` : "Trống"}
            </span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button
          className="zmp-btn"
          style={{ fontSize: 13 }}
          onClick={() => zmp.openUrl("http://localhost:4000/crm/mh/calendar")}
        >
          Xem lịch cả tháng →
        </button>
      </div>
    </ZaloMiniLayout>
  );
}
