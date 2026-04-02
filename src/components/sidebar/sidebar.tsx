import React from "react";
import { useApp } from "contexts/AppContext";

interface NavItem {
  page?: string;
  modal?: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: "blue" | "gold" | "purple" | "green";
}

const NAV_SALES: NavItem[] = [
  { page: "dashboard", label: "Dashboard", icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { page: "leads", label: "Lead Management", badge: 24, icon: <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
  { page: "pipeline", label: "Pipeline & Cơ hội", badge: 11, icon: <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { page: "campaigns", label: "Chiến dịch", badge: 3, badgeColor: "gold", icon: <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
  { page: "salesprocess", label: "Quy trình bán", badge: "Admin", badgeColor: "purple", icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> },
  { page: "salesdocs", label: "Tài liệu bán hàng", icon: <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { page: "customers", label: "Customer 360°", icon: <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { page: "tasks", label: "Tasks & Lịch hẹn", badge: 3, badgeColor: "gold", icon: <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
];

const NAV_OPS: NavItem[] = [
  { page: "approval", label: "Phê duyệt hồ sơ", badge: 7, icon: <svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
  { page: "incentive", label: "Hoa hồng Incentive", icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
  { page: "kpi", label: "Báo cáo KPI", icon: <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
  { page: "nps", label: "NPS & Chăm sóc", icon: <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
];

const NAV_ADMIN: NavItem[] = [
  { page: "org", label: "Tổ chức & Phân quyền", icon: <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
  { modal: "modal-corebankingsync", label: "Core Banking Sync", icon: <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg> },
  { modal: "modal-settings", label: "Cài đặt", icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
];

function NavItemRow({ item }: { item: NavItem }) {
  const { activePage, setActivePage, openModal, isCollapsedSidebar } = useApp();
  const isActive = item.page ? activePage === item.page : false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (item.page) setActivePage(item.page);
    else if (item.modal) openModal(item.modal);
  };

  const badgeClass = `nav-badge${item.badgeColor && item.badgeColor !== "blue" ? ` nav-badge--${item.badgeColor}` : ""}`;

  return (
    <a href="#" className={`nav-item${isActive ? " nav-item--active" : ""}`} onClick={handleClick} title={isCollapsedSidebar ? item.label : ""}>
      {item.icon}
      {!isCollapsedSidebar && <span className="nav-item__label">{item.label}</span>}
      {!isCollapsedSidebar && item.badge != null && <span className={badgeClass}>{item.badge}</span>}
    </a>
  );
}

export default function Sidebar() {
  const { user, isCollapsedSidebar, setIsCollapsedSidebar, logout, openModal } = useApp();

  return (
    <>
      <div className={`sidebar-overlay${isCollapsedSidebar ? " sidebar-overlay--show" : ""}`} onClick={() => setIsCollapsedSidebar(false)} />

      <aside className={`sidebar${isCollapsedSidebar ? " sidebar--collapsed" : ""}`}>
        {/* SALES */}
        <div className="nav-section">
          {!isCollapsedSidebar && <div className="nav-label">Sales</div>}
          {NAV_SALES.map(item => <NavItemRow key={item.page || item.modal} item={item} />)}
        </div>

        <div className="nav-divider" />

        {/* VẬN HÀNH */}
        <div className="nav-section">
          {!isCollapsedSidebar && <div className="nav-label">Vận hành</div>}
          {NAV_OPS.map(item => <NavItemRow key={item.page || item.modal} item={item} />)}
        </div>

        <div className="nav-divider" />

        {/* HỆ THỐNG / ADMIN */}
        <div className="nav-section">
          {!isCollapsedSidebar && <div className="nav-label">Hệ thống</div>}
          {NAV_ADMIN.map(item => <NavItemRow key={item.page || item.modal} item={item} />)}
        </div>

        {/* User footer */}
        <div className="sidebar__footer">
          <div className="nav-item" style={{ cursor: "pointer" }} onClick={() => openModal("modal-profile")}>
            <div className="sidebar__user-avatar">{user.initials}</div>
            {!isCollapsedSidebar && (
              <div className="sidebar__user-info">
                <div className="sidebar__user-name">{user.name}</div>
                <div className="sidebar__user-role">{user.role} · {user.branchCode}</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
