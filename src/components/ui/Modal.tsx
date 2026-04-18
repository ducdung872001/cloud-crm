import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  sub?: string;
  size?: "default" | "wide" | "xwide";
  footer?: ReactNode;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, kicker, sub, size = "default", footer, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal ${size === "wide" ? "wide" : size === "xwide" ? "xwide" : ""}`}>
        <div className="modal-head">
          {kicker ? <div className="modal-kicker">{kicker}</div> : null}
          <div className="modal-title">{title}</div>
          {sub ? <div className="modal-sub">{sub}</div> : null}
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}
