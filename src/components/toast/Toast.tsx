import React from "react";
import { useApp } from "contexts/AppContext";

export default function Toast() {
  const { toasts } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-item--${t.type}`}>
          <div className="dot" />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
