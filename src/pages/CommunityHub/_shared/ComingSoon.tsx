// [CH] Wrapper gọn quanh shared EmptyState — giữ để tương thích các page đã dùng.
// API giữ nguyên: ComingSoonBlock({title, description, onPreview, ...}).
import React from "react";
import EmptyState, { PreviewBanner as SharedPreviewBanner } from "@/components/EmptyState";
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
  icon,
  title = "Chưa có dữ liệu",
  description = "Dữ liệu sẽ được cập nhật khi module đi vào hoạt động.",
  previewLabel = "Xem trước giao diện",
  onPreview,
  hint = "Xem trước dùng dữ liệu mẫu để hình dung khi chạy thật. Đóng hoặc tải lại trang sẽ quay về trạng thái này.",
}: ComingSoonBlockProps) {
  return (
    <EmptyState
      variant="coming-soon"
      size="lg"
      icon={icon}
      title={title}
      description={description}
      secondaryAction={
        <button type="button" className="ch-preview-btn" onClick={onPreview}>
          👁️ {previewLabel}
        </button>
      }
      hint={hint}
    />
  );
}

export const PreviewBanner = SharedPreviewBanner;
