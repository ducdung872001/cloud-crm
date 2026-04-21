// [CH] Community Hub - Khóa học & CLB module
// TODO: wire up real API. Mock chỉ seed khi bật "Xem trước".
import React, { useState } from "react";
import { MOCK_COURSES, MOCK_CLUBS } from "@/mocks/community-hub/courses";
import { formatCurrency } from "reborn-util";
import { ComingSoonBlock, PreviewBanner } from "../_shared/ComingSoon";
import { showToast } from "@/utils/common";
import "./index.scss";

export default function CoursesPage() {
  document.title = "Khóa học & CLB";
  const [activeTab, setActiveTab] = useState<"courses" | "clubs">("courses");
  const [isPreview, setIsPreview] = useState(false);

  const enterPreview = () => {
    setIsPreview(true);
    showToast("Đang ở chế độ xem trước với dữ liệu demo", "info");
  };
  const exitPreview = () => setIsPreview(false);

  const courses = isPreview ? MOCK_COURSES : [];
  const clubs = isPreview ? MOCK_CLUBS : [];

  if (!isPreview) {
    return (
      <div className="ch-courses-page">
        <div className="ch-courses-page__header">
          <h2>Khóa học & CLB</h2>
        </div>
        <ComingSoonBlock
          title="Chưa có khóa học hay câu lạc bộ nào"
          description="Tạo khóa học/CLB đầu tiên để thành viên đăng ký tham gia."
          onPreview={enterPreview}
        />
      </div>
    );
  }

  return (
    <div className="ch-courses-page">
      <PreviewBanner onExit={exitPreview} />
      <div className="ch-courses-page__header">
        <h2>Khóa học & CLB</h2>
        <div className="tab-switch">
          <button className={activeTab === "courses" ? "active" : ""} onClick={() => setActiveTab("courses")}>
            Khóa học
          </button>
          <button className={activeTab === "clubs" ? "active" : ""} onClick={() => setActiveTab("clubs")}>
            Câu lạc bộ
          </button>
        </div>
      </div>

      {activeTab === "courses" && (
        <div className="ch-courses-page__grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-card__image">
                <div className="course-placeholder">{course.title.charAt(0)}</div>
                <span className={`course-type-badge ${course.type}`}>
                  {course.type === "paid" ? `${formatCurrency(course.price, ".", "")}đ` : "Miễn phí"}
                </span>
                {course.status === "full" && <span className="course-full-badge">Hết chỗ</span>}
              </div>
              <div className="course-card__body">
                <h3>{course.title}</h3>
                <p className="instructor">{course.instructor}</p>
                <div className="course-meta">
                  <span>{course.enrolled}/{course.max_slots} học viên</span>
                  <span>{course.sessions} buổi</span>
                </div>
                <div className="course-date">Bắt đầu: {course.start_date}</div>
              </div>
              <div className="course-card__footer">
                <button className="btn-detail">Xem chi tiết</button>
              </div>
            </div>
          ))}

          {/* Add new course card */}
          <div className="course-card course-card--add">
            <div className="add-content">
              <span className="add-icon">+</span>
              <span>Tạo khóa mới</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "clubs" && (
        <div className="ch-courses-page__clubs">
          {MOCK_CLUBS.map((club) => (
            <div key={club.id} className="club-card">
              <div className="club-card__header">
                <h3>{club.name}</h3>
                <span className="member-count">{club.members} thành viên</span>
              </div>
              <div className="club-card__body">
                <div className="club-info">
                  <span className="label">Trưởng nhóm:</span>
                  <span className="value">{club.leader}</span>
                </div>
                <div className="club-info">
                  <span className="label">Buổi tiếp theo:</span>
                  <span className="value">{club.next_meeting}</span>
                </div>
              </div>
              <div className="club-card__footer">
                <button className="btn-detail">Xem chi tiết</button>
                <button className="btn-members">DS Thành viên</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
