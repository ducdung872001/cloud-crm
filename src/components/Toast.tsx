import { useApp } from "../context/AppContext";

const KIND_ICON: Record<string, string> = {
  success: "✓",
  info: "◆",
  warn: "⚠",
};

export default function ToastHost() {
  const { toasts } = useApp();

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          <div className="toast-ico">{KIND_ICON[t.kind] ?? "◆"}</div>
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            {t.sub ? <div className="toast-sub">{t.sub}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
