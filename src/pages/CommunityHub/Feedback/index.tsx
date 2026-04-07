// [CH] Community Hub - Phản hồi khách hàng module
import React, { useState } from "react";
import { MOCK_FEEDBACKS } from "@/mocks/community-hub/feedback";
import "./index.scss";

export default function FeedbackPage() {
  document.title = "Phản hồi thành viên";
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [feedbacks, setFeedbacks] = useState(MOCK_FEEDBACKS);

  const filtered = filter === "all" ? feedbacks : feedbacks.filter((f) => f.status === filter);

  const handleResolve = (id: string) => {
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "resolved" as const } : f))
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "#D64B3A";
      case "medium": return "#E8922A";
      case "low": return "#4CAF7D";
      default: return "#7A6B5A";
    }
  };

  const getTimeDiff = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Vừa xong";
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  return (
    <div className="ch-feedback-page">
      <div className="ch-feedback-page__header">
        <h2>Phản hồi thành viên</h2>
        <div className="filter-tabs">
          {([
            ["all", "Tất cả"],
            ["open", "Chưa xử lý"],
            ["in_progress", "Đang xử lý"],
            ["resolved", "Đã xong"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key)}
            >
              {label}
              {key === "open" && (
                <span className="count-badge">
                  {feedbacks.filter((f) => f.status === "open").length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="ch-feedback-page__list">
        {filtered.map((fb) => (
          <div key={fb.id} className={`feedback-item status-${fb.status}`}>
            <div className="feedback-item__priority" style={{ background: getPriorityColor(fb.priority) }} />
            <div className="feedback-item__content">
              <div className="feedback-header">
                <strong>{fb.member_name}</strong>
                <span className="feedback-time">{getTimeDiff(fb.created_at)}</span>
              </div>
              <p className="feedback-message">"{fb.message}"</p>
              <div className="feedback-meta">
                <span className={`category-badge ${fb.category}`}>
                  {fb.category === "maintenance" && "Bảo trì"}
                  {fb.category === "request" && "Yêu cầu"}
                  {fb.category === "suggestion" && "Đề xuất"}
                  {fb.category === "complaint" && "Phàn nàn"}
                </span>
                <span className={`status-badge ${fb.status}`}>
                  {fb.status === "open" && "Chưa xử lý"}
                  {fb.status === "in_progress" && "Đang xử lý"}
                  {fb.status === "resolved" && "Đã xong"}
                </span>
              </div>
            </div>
            <div className="feedback-item__actions">
              {fb.status !== "resolved" && (
                <>
                  <button className="btn-reply">Trả lời</button>
                  <button className="btn-resolve" onClick={() => handleResolve(fb.id)}>
                    Đánh dấu xong
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">Không có phản hồi nào.</div>
        )}
      </div>
    </div>
  );
}
