// [MH] MentorHub - Danh sách khoá học của mentor
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MOCK_COURSES } from "@/mocks/mentorhub";
import "../_shared/styles.scss";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";
type Status = "all" | "live" | "upcoming" | "draft" | "ended";

export default function MentorHubCoursesPage() {
  document.title = "MentorHub · Khoá học";
  const [filter, setFilter] = useState<Status>("all");
  const filtered = filter === "all" ? MOCK_COURSES : MOCK_COURSES.filter((c) => c.status === filter);

  return (
    <div className="mh">
      <div className="mh__hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="mh__kicker">QUẢN LÝ</div>
          <h1>Khoá học của <em>tôi</em></h1>
          <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>{MOCK_COURSES.length} khoá · {MOCK_COURSES.filter((c) => c.status === "live").length} đang diễn ra</p>
        </div>
        <Link to="/mh/courses/new" className="mh__btn mh__btn--primary">+ Tạo khoá mới</Link>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["all", "live", "upcoming", "draft", "ended"] as Status[]).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className="mh__btn" style={filter === s ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)" } : {}}>
            {s === "all" ? "Tất cả" : s === "live" ? "Đang live" : s === "upcoming" ? "Sắp bắt đầu" : s === "draft" ? "Nháp" : "Đã kết thúc"}
          </button>
        ))}
      </div>

      <div className="mh__grid mh__grid--3" style={{ gap: 20 }}>
        {filtered.map((c) => (
          <div key={c.id} className="mh__card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: c.iconBg, height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "#fff", fontFamily: "'Fraunces', serif" }}>
              {c.icon}
            </div>
            <div style={{ padding: 20 }}>
              <span className={`mh__pill mh__pill--${c.status}`}>{c.status === "live" ? "● Đang live" : c.status === "upcoming" ? "Sắp bắt đầu" : c.status === "draft" ? "Nháp" : "Đã kết thúc"}</span>
              <h3 style={{ margin: "12px 0 16px", fontSize: 18 }}>{c.title}</h3>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--mh-ink-soft)", marginBottom: 10 }} className="mh__mono">
                <span>{c.sessionsDone}/{c.sessions} buổi</span>
                <span>{c.registered}/{c.capacity} HV</span>
                {c.nps > 0 && <span>NPS {c.nps}</span>}
              </div>
              <div className="mh__progress" style={{ marginBottom: 16 }}>
                <div className="mh__progress-fill" style={{ width: `${(c.sessionsDone / c.sessions) * 100}%` }}></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="mh__mono" style={{ fontSize: 13, color: "var(--mh-teal)", fontWeight: 600 }}>{formatVND(c.revenue)}</div>
                <Link to={`/mh/courses/${c.id}/edit`} className="mh__btn" style={{ padding: "6px 14px", fontSize: 13 }}>Sửa</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
