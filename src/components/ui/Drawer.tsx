import { useEffect, type ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  wide?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Drawer({ open, onClose, title, sub, wide, footer, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className={`drawer ${wide ? "wide" : ""}`}>
        <div className="drawer-head">
          <div>
            <div className="drawer-title">{title}</div>
            {sub ? <div className="drawer-sub">{sub}</div> : null}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} title="Đóng">
            ✕
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer ? <div className="drawer-foot">{footer}</div> : null}
      </aside>
    </>
  );
}
