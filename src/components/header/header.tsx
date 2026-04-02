import React, { useState } from "react";
import { useApp } from "contexts/AppContext";
import "./header.scss";

export default function Header() {
  const { user, isCollapsedSidebar, setIsCollapsedSidebar, setActivePage, openModal } = useApp();
  const [searchVal, setSearchVal] = useState("");

  return (
    <header className="header">
      {/* Logo + hamburger */}
      <div className="header__logo">
        <button
          className="header__hamburger"
          onClick={() => setIsCollapsedSidebar(!isCollapsedSidebar)}
          title="Toggle sidebar"
        >
          <svg viewBox="0 0 24 24"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
        </button>
        <div className="header__logo-icon">
          {/* Bank icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M3 10h18M3 6l9-3 9 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
          </svg>
        </div>
        <span className="header__logo-text">CRM<span>Banking</span></span>
      </div>

      {/* Search */}
      <div className="header__search">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Tìm kiếm KH, cơ hội, hồ sơ vay..."
        />
      </div>

      {/* Right actions */}
      <div className="header__right">
        {/* Core Banking Sync */}
        <div
          className="header__btn"
          onClick={() => openModal("modal-corebankingsync")}
          title="Core Banking Sync"
        >
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M2 12h2M20 12h2"/></svg>
          <span className="header__sync-dot" />
        </div>

        {/* Notifications */}
        <div
          className="header__btn"
          onClick={() => openModal("modal-notifications")}
          title="Thông báo"
        >
          <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          <span className="header__badge">5</span>
        </div>

        {/* Calendar */}
        <div
          className="header__btn"
          onClick={() => setActivePage("tasks")}
          title="Tasks & Lịch hẹn"
        >
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>

        {/* Avatar */}
        <div
          className="header__avatar"
          onClick={() => openModal("modal-profile")}
          title="Hồ sơ cá nhân"
        >
          {user.initials}
        </div>
      </div>
    </header>
  );
}
