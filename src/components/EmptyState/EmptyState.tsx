// Shared EmptyState — unify pattern trên toàn project.
// Variants:
//   - "no-data"       : chưa có dữ liệu (mặc định)
//   - "no-results"    : có filter/search nhưng không tìm thấy
//   - "coming-soon"   : module chưa chạy — kèm nút Xem trước (preview)
//   - "success-empty" : rỗng mang nghĩa tích cực (không có cảnh báo / không có đơn hủy)
//
// Usage tối thiểu:
//   <EmptyState title="Chưa có đơn hàng" />
// Nâng cao:
//   <EmptyState variant="coming-soon" title="Sắp ra mắt"
//               description="..." action={<button>+ Tạo đơn</button>}
//               secondaryAction={<button onClick={preview}>Xem trước</button>} />

import React from "react";
import "./EmptyState.scss";

export type EmptyStateVariant = "no-data" | "no-results" | "coming-soon" | "success-empty";
export type EmptyStateSize = "sm" | "md" | "lg";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  /** Emoji string hoặc React node (SVG). Bỏ trống → icon mặc định theo variant. */
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  /** CTA chính — thường là button primary */
  action?: React.ReactNode;
  /** CTA phụ (ví dụ "Xem trước" cho coming-soon) */
  secondaryAction?: React.ReactNode;
  /** Ghi chú italic nhỏ dưới actions */
  hint?: React.ReactNode;
  size?: EmptyStateSize;
  className?: string;
}

const DEFAULT_ICON: Record<EmptyStateVariant, string> = {
  "no-data":       "📭",
  "no-results":    "🔍",
  "coming-soon":   "🚧",
  "success-empty": "✨",
};

export default function EmptyState({
  variant = "no-data",
  icon,
  title,
  description,
  action,
  secondaryAction,
  hint,
  size = "md",
  className = "",
}: EmptyStateProps) {
  const resolvedIcon = icon ?? DEFAULT_ICON[variant];

  return (
    <div className={`empty-state empty-state--${variant} empty-state--${size} ${className}`.trim()}>
      <div className="empty-state__icon">
        {typeof resolvedIcon === "string" ? <span>{resolvedIcon}</span> : resolvedIcon}
      </div>
      <div className="empty-state__title">{title}</div>
      {description && <div className="empty-state__desc">{description}</div>}
      {(action || secondaryAction) && (
        <div className="empty-state__actions">
          {action}
          {secondaryAction}
        </div>
      )}
      {hint && <div className="empty-state__hint">{hint}</div>}
    </div>
  );
}

// ─── Preview banner (dùng kèm variant="coming-soon" khi bật preview) ──────────
interface PreviewBannerProps {
  onExit: () => void;
  text?: string;
  className?: string;
}

export function PreviewBanner({
  onExit,
  text = "Bạn đang xem giao diện demo với dữ liệu mẫu. Khi dữ liệu thật có, nội dung này sẽ thay đổi.",
  className = "",
}: PreviewBannerProps) {
  return (
    <div className={`preview-banner ${className}`.trim()}>
      <span className="preview-banner__badge">👁️ Xem trước</span>
      <span className="preview-banner__text">{text}</span>
      <button className="preview-banner__close" onClick={onExit}>
        Thoát xem trước ✕
      </button>
    </div>
  );
}
