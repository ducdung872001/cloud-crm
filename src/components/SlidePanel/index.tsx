// [CH] SlidePanel — panel trượt từ phải sang trái, dùng chung cho nhiều form
import React, { useEffect } from "react";
import "./index.scss";

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  width?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function SlidePanel({ isOpen, onClose, title, width = "44rem", children, footer }: SlidePanelProps) {
  // Lock body scroll khi mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="slide-panel-overlay" onClick={onClose} />
      <div className="slide-panel" style={{ width }}>
        <div className="slide-panel__header">
          <h3>{title}</h3>
          <button className="slide-panel__close" onClick={onClose}>✕</button>
        </div>
        <div className="slide-panel__body">
          {children}
        </div>
        {footer && (
          <div className="slide-panel__footer">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
