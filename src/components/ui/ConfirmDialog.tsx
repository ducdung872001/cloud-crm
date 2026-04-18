import Modal from "./Modal";

export type ConfirmKind = "danger" | "warn" | "info";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  kind?: ConfirmKind;
  icon?: string;
}

const DEFAULT_ICONS: Record<ConfirmKind, string> = {
  danger: "⚠",
  warn: "!",
  info: "ℹ",
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  kind = "danger",
  icon,
}: Props) {
  const btnCls = kind === "danger" ? "btn destructive" : kind === "warn" ? "btn primary" : "btn primary";

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="confirm-body">
        <div className={`confirm-ico ${kind === "warn" ? "warn" : kind === "info" ? "info" : ""}`}>{icon ?? DEFAULT_ICONS[kind]}</div>
        <div className="confirm-title">{title}</div>
        {message ? <div className="confirm-message">{message}</div> : null}
      </div>
      <div className="modal-foot">
        <button type="button" className="btn" onClick={onClose}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={btnCls}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
