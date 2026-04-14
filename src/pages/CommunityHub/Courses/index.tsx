// [FitPro] Training Programs & Cộng đồng BO
// Thay thế "Courses & Clubs" co-working bằng giáo trình video + community BO
import React, { useState } from "react";
import { MOCK_COURSES, MOCK_CLUBS } from "@/mocks/community-hub/courses";
import "./index.scss";

const intensityMeta: Record<string, { label: string; color: string }> = {
  low: { label: "Nhẹ", color: "#4DE4C4" },
  medium: { label: "Vừa", color: "#00C9A7" },
  high: { label: "Cao", color: "#FF8C42" },
  very_high: { label: "Rất cao", color: "#E8473B" },
};

export default function CoursesPage() {
  document.title = "Giáo trình tập luyện FitPro";
  const [activeTab, setActiveTab] = useState<"programs" | "community">("programs");

  return (
    <div className="ch-courses-page">
      <div className="ch-courses-page__header">
        <div>
          <h2>Giáo trình & Cộng đồng FitPro</h2>
          <p style={{ fontSize: 13, color: "#6B8A85", marginTop: 4 }}>
            Video hướng dẫn chuẩn hóa — dạy ngay cả khi 0 khách. Thư viện cộng đồng BO.
          </p>
        </div>
        <div className="tab-switch">
          <button className={activeTab === "programs" ? "active" : ""} onClick={() => setActiveTab("programs")}>
            🎥 Giáo trình Video
          </button>
          <button className={activeTab === "community" ? "active" : ""} onClick={() => setActiveTab("community")}>
            👥 Cộng đồng BO
          </button>
        </div>
      </div>

      {activeTab === "programs" && (
        <div className="ch-courses-page__grid">
          {MOCK_COURSES.map((course: any) => {
            const intensity = intensityMeta[course.intensity] || intensityMeta.medium;
            return (
              <div key={course.id} className="course-card">
                <div className="course-card__image" style={{ background: `linear-gradient(135deg, ${intensity.color} 0%, #00C9A7 100%)` }}>
                  <div className="course-placeholder" style={{ color: "#fff", fontSize: 36 }}>
                    {course.intensity === "low" ? "🧘" : course.intensity === "medium" ? "💪" : course.intensity === "high" ? "🔥" : "⚡"}
                  </div>
                  <span className="course-type-badge" style={{ background: "rgba(255,255,255,.9)", color: intensity.color, fontWeight: 700 }}>
                    {intensity.label}
                  </span>
                </div>
                <div className="course-card__body">
                  <h3 style={{ fontSize: 14 }}>{course.title}</h3>
                  <p className="instructor" style={{ fontSize: 11, color: "#6B8A85" }}>🎓 {course.instructor}</p>
                  <div className="course-meta">
                    <span>🎯 {course.target || "Chung"}</span>
                  </div>
                  <div className="course-meta" style={{ marginTop: 4 }}>
                    <span>⏱ {course.duration_minutes || 45} phút/buổi</span>
                    <span>📅 {course.sessions} buổi</span>
                  </div>
                  <div className="course-date" style={{ fontSize: 11, color: "#00C9A7", marginTop: 4 }}>
                    ✅ {course.enrolled} học viên đang theo
                  </div>
                </div>
                <div className="course-card__footer">
                  <button className="btn-detail">▶️ Xem video mẫu</button>
                </div>
              </div>
            );
          })}

          {/* Add new program card */}
          <div className="course-card course-card--add">
            <div className="add-content">
              <span className="add-icon">+</span>
              <span>Thêm giáo trình mới</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "community" && (
        <div className="ch-courses-page__clubs">
          {MOCK_CLUBS.map((club) => (
            <div key={club.id} className="club-card">
              <div className="club-card__header">
                <h3>{club.name}</h3>
                <span className="member-count">{club.members} BO</span>
              </div>
              <div className="club-card__body">
                <div className="club-info">
                  <span className="label">Admin nhóm:</span>
                  <span className="value">{club.leader}</span>
                </div>
                <div className="club-info">
                  <span className="label">Meetup tiếp theo:</span>
                  <span className="value">{club.next_meeting}</span>
                </div>
              </div>
              <div className="club-card__footer">
                <button className="btn-detail">Vào nhóm</button>
                <button className="btn-members">DS Business Owner</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
