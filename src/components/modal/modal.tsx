import React, { useEffect, ReactNode } from "react";
import { useApp } from "contexts/AppContext";

interface ModalProps {
  id: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  onClose?: () => void;
}

export default function Modal({ id, title, children, footer, size = "md", onClose }: ModalProps) {
  const { activeModal, closeModal } = useApp();

  const handleClose = () => {
    closeModal();
    onClose?.();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeModal === id) handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeModal, id]);

  if (activeModal !== id) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className={`modal modal--${size}`}>
        <div className="modal__header">
          <span className="modal__title">{title}</span>
          <button className="modal__close" onClick={handleClose}>✕</button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
