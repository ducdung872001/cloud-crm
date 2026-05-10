import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AppManagement.scss";

// Placeholder cho UC-12: Quản lý ứng dụng (Phát hành App + Edition).
// Hiện tại dùng mock data — wire API thật sau khi BE Platform Service deploy.
// Spec UI: docs/platform-service/11-UI-Design.md § 11.3.1.

type AppRow = {
  code: string;
  name: string;
  iconLabel: string;
  status: "active" | "archived" | "beta";
  ordinal: number;
  editions: string[];
  tenantsCount: number;
};

const MOCK_APPS: AppRow[] = [
  { code: "CRM",        name: "Quản lý khách hàng (CRM)", iconLabel: "📇", status: "active", ordinal: 1,
    editions: ["CRM-SPA", "CRM-EDU", "CRM-LOYALTY", "CRM-REALTY", "CRM-GENERIC"], tenantsCount: 48 },
  { code: "BPM",        name: "Quản lý quy trình (BPM)",  iconLabel: "🔁", status: "active", ordinal: 2,
    editions: ["BPM-GENERIC"], tenantsCount: 12 },
  { code: "CXM",        name: "CXM",                       iconLabel: "💬", status: "beta",   ordinal: 3,
    editions: ["CXM-GENERIC"], tenantsCount: 0 },
  { code: "POS",        name: "Bán hàng (POS)",            iconLabel: "🛒", status: "active", ordinal: 4,
    editions: ["POS-FNB", "POS-RETAIL", "POS-GENERIC"], tenantsCount: 5 },
  { code: "SUPERADMIN", name: "Quản trị nền tảng",         iconLabel: "🛡️", status: "active", ordinal: 99,
    editions: ["SUPERADMIN-GENERIC"], tenantsCount: 1 },
];

export default function AppList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "beta" | "archived">("all");

  const filtered = useMemo(() => {
    return MOCK_APPS.filter((app) => {
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!app.code.toLowerCase().includes(q) && !app.name.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => a.ordinal - b.ordinal);
  }, [query, statusFilter]);

  return (
    <div className="app-management">
      <div className="am-header">
        <h1>Quản lý ứng dụng</h1>
        <button className="am-btn-primary" onClick={() => alert("Modal Thêm App — chờ BE Platform deploy")}>
          + Thêm App
        </button>
      </div>

      <div className="am-mock-banner">
        ⚠️ <strong>Đang dùng mock data</strong> — BE Platform Service chưa deploy. Page sẽ wire vào{" "}
        <code>GET /api/v1/app</code> + <code>POST /api/v1/app</code>. Spec ở{" "}
        <code>docs/platform-service/05-API-Spec.md § 5.5b</code>.
      </div>

      <div className="am-toolbar">
        <input
          type="text"
          className="am-search"
          placeholder="🔍 Tìm theo tên / code…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="am-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="beta">Beta</option>
          <option value="archived">Đã ẩn</option>
        </select>
      </div>

      <div className="am-card-list">
        {filtered.map((app) => (
          <div key={app.code} className="am-card">
            <div className="am-app-row">
              <div className="am-app-icon">{app.iconLabel}</div>
              <div className="am-app-body">
                <div className="am-app-title-row">
                  <span className="am-app-title">{app.name}</span>
                  <span className="am-tag-code">{app.code}</span>
                  {app.status === "beta" && <span className="am-tag am-tag-beta">Beta</span>}
                  {app.status === "archived" && <span className="am-tag am-tag-archived">Đã ẩn</span>}
                </div>
                <div className="am-app-desc">
                  {app.editions.length} phiên bản: {app.editions.join(", ")}
                </div>
                <div className="am-app-meta">
                  {app.tenantsCount} tenant đang dùng • Thứ tự: {app.ordinal}
                </div>
              </div>
              <div className="am-app-actions">
                <button className="am-btn-secondary" onClick={() => navigate(`/app_management/${app.code}/edition`)}>
                  Xem editions →
                </button>
                <button className="am-btn-icon" onClick={() => alert(`Sửa App ${app.code} — chờ BE`)} title="Sửa">
                  ✏️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="am-empty">
          Không tìm thấy app nào khớp filter.
        </div>
      )}
    </div>
  );
}
