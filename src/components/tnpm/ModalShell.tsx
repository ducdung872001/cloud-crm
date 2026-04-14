import React from "react";

export interface ModalShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number | string;
  wide?: boolean;
}

/**
 * Reusable modal wrapper. Handles overlay click-outside-to-close,
 * header title, close X, body, footer.
 */
export const ModalShell: React.FC<ModalShellProps> = ({
  title, onClose, children, footer, maxWidth, wide,
}) => (
  <div className="modal-overlay" onClick={onClose}>
    <div
      className={`modal-box${wide ? " modal-box--wide" : ""}`}
      onClick={(e) => e.stopPropagation()}
      style={maxWidth ? { maxWidth } : undefined}
    >
      <div className="modal-header">
        <h2 className="modal-title">{title}</h2>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
);

export interface ConfirmDialogProps {
  title: string;
  message: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

/**
 * Simple confirm dialog (Delete/Cancel style).
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title, message, onCancel, onConfirm, confirmLabel = "Xác nhận", cancelLabel = "Hủy", danger = false,
}) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
      <h3>⚠️ {title}</h3>
      <p>{message}</p>
      <div className="confirm-dialog__actions">
        <button className="btn btn-outline" onClick={onCancel}>{cancelLabel}</button>
        <button className={danger ? "btn btn-danger" : "btn btn-primary"} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);
