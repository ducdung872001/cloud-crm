import React, { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "components/icon";
import { showToast } from "utils/common";
import { SHORTCUT_OPTIONS, MAX_SHORTCUT } from "model/dashboard/DashboardModel";
import { useShortcut } from "hooks/useShortcut";
import { resolveShortcuts, SHORTCUT_MAP } from "./shortcutMap";
import "./shortcut.scss";

interface ShortcutProps {
  classNames?: string;
}

export default function Shortcut({ classNames }: ShortcutProps) {
  const {
    activeKeys,
    isLoading,
    isSaving,
    draftKeys,
    toggleDraftKey,
    saveShortcuts,
    resetDraft,
    maxShortcut,
  } = useShortcut();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const shortcutsToRender = resolveShortcuts(activeKeys);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleOpenModal = () => {
    // resetDraft đã được gọi trong hook khi user bấm Hủy,
    // nhưng mở modal lại cũng cần sync draft với active hiện tại
    resetDraft();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    resetDraft();
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (draftKeys.length === 0) {
      showToast("Vui lòng chọn ít nhất 1 tính năng", "warning");
      return;
    }
    await saveShortcuts();
    setIsModalOpen(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Card shortcut ── */}
      <div className={`card-box shortcut${classNames ? ` ${classNames}` : ""}`}>
        <div className="title d-flex align-items-start justify-content-between">
          <h2>Truy cập nhanh</h2>
        </div>

        <div className="shortcut__list d-flex justify-content-between">
          {isLoading ? (
            // Skeleton loading
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shortcut__item shortcut__item--skeleton" />
            ))
          ) : (
            <>
              {shortcutsToRender.map((s, index) => (
                <Link
                  key={index}
                  className="d-flex flex-column align-items-center shortcut__item"
                  to={s.path ?? ""}
                  title={s.title}
                  target={s.target ?? ""}
                  style={{ backgroundColor: s.background }}
                  onClick={(e) => {
                    if (!s.path) {
                      e.preventDefault();
                      showToast("Tính năng đang trong quá trình phát triển!", "warning");
                    }
                  }}
                >
                  {s.icon}
                  <span>{s.title}</span>
                </Link>
              ))}

              {/* Nút tùy chỉnh lối tắt — luôn hiển thị cuối */}
              <button
                className="d-flex flex-column align-items-center shortcut__item shortcut__item--customize"
                onClick={handleOpenModal}
                title="Tùy chỉnh lối tắt"
                type="button"
              >
                <Icon name="GearFill" />
                <span>Tùy chỉnh lối tắt</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Modal tùy chỉnh ── */}
      {isModalOpen && (
        <div className="shortcut-modal__overlay" onClick={handleCancel}>
          <div
            className="shortcut-modal__box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shortcut-modal__header">
              <h3>Tùy chỉnh truy cập nhanh</h3>
              <button
                className="shortcut-modal__close"
                onClick={handleCancel}
                type="button"
              >
                <Icon name="XLg" />
              </button>
            </div>

            {/* Description */}
            <p className="shortcut-modal__desc">
              Chọn các tính năng bạn muốn hiển thị trên thanh truy cập nhanh ở màn hình chính
              (Tối đa {maxShortcut} tính năng).
            </p>

            {/* Option list */}
            <div className="shortcut-modal__list">
              {SHORTCUT_OPTIONS.map((option) => {
                const isChecked = draftKeys.includes(option.key);
                const isDisabled = !isChecked && draftKeys.length >= maxShortcut;
                const meta = SHORTCUT_MAP[option.key];

                return (
                  <label
                    key={option.key}
                    className={`shortcut-modal__option${isChecked ? " shortcut-modal__option--checked" : ""}${isDisabled ? " shortcut-modal__option--disabled" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={() => toggleDraftKey(option.key)}
                    />
                    <span
                      className="shortcut-modal__option-icon"
                      style={{ backgroundColor: meta?.background ?? "#ccc" }}
                    >
                      {meta?.icon}
                    </span>
                    <span className="shortcut-modal__option-label">{option.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Footer */}
            <div className="shortcut-modal__footer">
              <span className="shortcut-modal__count">
                Đã chọn {draftKeys.length}/{maxShortcut}
              </span>
              <div className="shortcut-modal__actions">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={isSaving || draftKeys.length === 0}
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}