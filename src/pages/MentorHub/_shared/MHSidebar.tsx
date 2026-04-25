// Sidebar shared across all MentorHub admin pages.
// Mirrors the nav structure from the prototype.
import React from "react";
import { NavLink } from "react-router-dom";
import "./MHSidebar.scss";

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
  badgeTone?: "default" | "danger";
}
interface NavGroup {
  title: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    title: "TỔNG QUAN",
    items: [
      { label: "Dashboard", path: "/mh/dashboard", icon: "◐" },
      { label: "Lịch", path: "/mh/calendar", icon: "▦" },
    ],
  },
  {
    title: "KHÓA HỌC",
    items: [
      { label: "Khóa học", path: "/mh/courses", icon: "⎈", badge: 12 },
      { label: "Tạo mới", path: "/mh/courses/new", icon: "+" },
    ],
  },
  {
    title: "HỌC VIÊN",
    items: [
      { label: "Học viên", path: "/mh/students", icon: "☉", badge: "1,240" },
      { label: "Hỗ trợ", path: "/mh/tickets", icon: "✉", badge: 5, badgeTone: "danger" },
      { label: "Chat", path: "/mh/chat", icon: "❑" },
    ],
  },
  {
    title: "SAU BUỔI HỌC",
    items: [
      { label: "AI Ghi chú", path: "/mh/session-review", icon: "✦" },
      { label: "Feedback · NPS", path: "/mh/feedback", icon: "★" },
    ],
  },
  {
    title: "KINH DOANH",
    items: [
      { label: "Doanh thu", path: "/mh/revenue", icon: "₫" },
      { label: "Marketing", path: "/mh/marketing", icon: "◇" },
      { label: "CRM", path: "/mh/crm", icon: "◉" },
    ],
  },
  {
    title: "CÀI ĐẶT",
    items: [
      { label: "Cài đặt", path: "/mh/settings", icon: "⚙" },
    ],
  },
];

export default function MHSidebar() {
  return (
    <aside className="mh-sidebar">
      <div className="mh-sidebar__brand">
        <span className="mh-sidebar__mark">◐</span>
        <span className="mh-sidebar__wordmark">MentorHub</span>
      </div>

      <div className="mh-sidebar__mentor">
        <div className="mh-sidebar__avatar" style={{ background: "#134E4A" }}>NT</div>
        <div>
          <div className="mh-sidebar__name">Nguyễn Trọng Khoa</div>
          <div className="mh-sidebar__role">Principal Engineer · Ex-Grab</div>
        </div>
      </div>

      <nav className="mh-sidebar__nav">
        {GROUPS.map((g) => (
          <div className="mh-sidebar__group" key={g.title}>
            <div className="mh-sidebar__group-title">{g.title}</div>
            {g.items.map((it) => (
              <NavLink
                key={it.path}
                to={it.path}
                className={({ isActive }) =>
                  `mh-sidebar__link${isActive ? " mh-sidebar__link--active" : ""}`
                }
              >
                <span className="mh-sidebar__icon">{it.icon}</span>
                <span className="mh-sidebar__label">{it.label}</span>
                {it.badge !== undefined && (
                  <span className={`mh-sidebar__badge${it.badgeTone === "danger" ? " is-danger" : ""}`}>
                    {it.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="mh-sidebar__foot">
        <div className="mh-sidebar__foot-line">MENTORHUB · REBORN JSC</div>
        <div className="mh-sidebar__foot-line">v0.1 MVP</div>
      </div>
    </aside>
  );
}
