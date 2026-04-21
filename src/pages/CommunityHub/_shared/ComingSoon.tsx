// [CH] Community Hub — Shared "Coming soon + Xem trước" pattern
// Dùng cho các page đang chờ BE API. Khi preview ON, page tự render với mock data.
// State preview KHÔNG persist — refresh = về trạng thái "Chưa có dữ liệu".
import React from "react";
import "./ComingSoon.scss";

interface ComingSoonBlockProps {
  icon?: string;
  title?: string;
  description?: string;
  previewLabel?: string;
  onPreview: () => void;
  hint?: string;
}

export function ComingSoonBlock({
  icon = "🚧",
  title = "Chưa có dữ liệu",
  description = "Dữ liệu sẽ được cập nhật khi module đi vào hoạt động.",
  previewLabel = "Xem trước giao diện",
  onPreview,
  hint = "Xem trước dùng dữ liệu mẫu để hình dung khi chạy thật. Đóng hoặc tải lại trang sẽ quay về trạng thái này.",
}: ComingSoonBlockProps) {
  return (
    <div className="ch-coming-soon">
      <div className="ch-coming-soon__icon">{icon}</div>
      <div className="ch-coming-soon__title">{title}</div>
      <div className="ch-coming-soon__desc">{description}</div>
      <button type="button" className="ch-coming-soon__btn" onClick={onPreview}>
        👁️ {previewLabel}
      </button>
      {hint && <div className="ch-coming-soon__hint">{hint}</div>}
    </div>
  );
}

interface PreviewBannerProps {
  onExit: () => void;
  text?: string;
}

export function PreviewBanner({
  onExit,
  text = "Bạn đang xem giao diện demo với dữ liệu mẫu. Khi BE sẵn sàng, dữ liệu thật sẽ thay thế chỗ này.",
}: PreviewBannerProps) {
  return (
    <div className="ch-preview-banner">
      <span className="ch-preview-banner__badge">👁️ Xem trước</span>
      <span className="ch-preview-banner__text">{text}</span>
      <button className="ch-preview-banner__close" onClick={onExit}>
        Thoát xem trước ✕
      </button>
    </div>
  );
}
