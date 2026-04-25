// Zalo Mini App layout — viewport 375px, bottom tab bar, no sidebar.
// Route: /zalo/* — public (không cần login CRM; auth bằng Zalo OAuth)
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./zalo-mini.scss";

interface Props { children: React.ReactNode; title?: string }

const TABS = [
  { path: "/zalo",          icon: "◐", label: "Home" },
  { path: "/zalo/today",    icon: "▦", label: "Hôm nay" },
  { path: "/zalo/tickets",  icon: "✉", label: "Ticket" },
  { path: "/zalo/students", icon: "☉", label: "HV" },
  { path: "/zalo/more",     icon: "⋯", label: "Khác" },
];

export default function ZaloMiniLayout({ children, title }: Props) {
  const location = useLocation();

  return (
    <div className="zmp">
      <div className="zmp__frame">
        {/* Status bar simulation khi chạy trên desktop */}
        <div className="zmp__statusbar">
          <span className="zmp__sb-time">20:05</span>
          <span className="zmp__sb-brand">◐ MentorHub</span>
          <span className="zmp__sb-icons">●●● 87%</span>
        </div>

        {/* App header */}
        {title && (
          <div className="zmp__header">
            <h1 className="zmp__header-title">{title}</h1>
          </div>
        )}

        {/* Scrollable content */}
        <main className="zmp__content">{children}</main>

        {/* Bottom tab bar */}
        <nav className="zmp__tabbar">
          {TABS.map((t) => {
            const isActive = t.path === "/zalo" ? location.pathname === "/zalo" : location.pathname.startsWith(t.path);
            return (
              <Link key={t.path} to={t.path} className={"zmp__tab" + (isActive ? " is-active" : "")}>
                <span className="zmp__tab-icon">{t.icon}</span>
                <span className="zmp__tab-label">{t.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Preview chrome — khi chạy ngoài Zalo app */}
      <aside className="zmp__preview-chrome">
        <div className="zmp__preview-badge">📱 ZALO MINI APP · PREVIEW 375px</div>
        <div className="zmp__preview-note">
          Chạy trong Zalo app: <code>zalo.me/s/{"{APP_ID}"}/mentorhub</code><br />
          Desktop preview: drag resize trình duyệt hoặc dùng DevTools Device Mode.
        </div>
      </aside>
    </div>
  );
}
