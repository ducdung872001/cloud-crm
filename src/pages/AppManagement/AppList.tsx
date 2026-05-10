import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  {
    code: "CRM",
    name: "Quản lý khách hàng (CRM)",
    iconLabel: "📇",
    status: "active",
    ordinal: 1,
    editions: ["CRM-SPA", "CRM-EDU", "CRM-LOYALTY", "CRM-REALTY", "CRM-GENERIC"],
    tenantsCount: 48,
  },
  {
    code: "BPM",
    name: "Quản lý quy trình (BPM)",
    iconLabel: "🔁",
    status: "active",
    ordinal: 2,
    editions: ["BPM-GENERIC"],
    tenantsCount: 12,
  },
  {
    code: "CXM",
    name: "CXM",
    iconLabel: "💬",
    status: "beta",
    ordinal: 3,
    editions: ["CXM-GENERIC"],
    tenantsCount: 0,
  },
  {
    code: "POS",
    name: "Bán hàng (POS)",
    iconLabel: "🛒",
    status: "active",
    ordinal: 4,
    editions: ["POS-FNB", "POS-RETAIL", "POS-GENERIC"],
    tenantsCount: 5,
  },
  {
    code: "SUPERADMIN",
    name: "Quản trị nền tảng (Superadmin)",
    iconLabel: "🛡️",
    status: "active",
    ordinal: 99,
    editions: ["SUPERADMIN-GENERIC"],
    tenantsCount: 1,
  },
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
    <div style={{ padding: "24px 32px", fontFamily: "inherit" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>QUẢN LÝ ỨNG DỤNG</h1>
        <button
          onClick={() => alert("Modal Thêm App — chờ BE Platform deploy")}
          style={{ padding: "10px 20px", background: "#0F766E", color: "#fff", border: 0, borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
        >
          + Thêm App
        </button>
      </div>

      <div style={{
        background: "#FEF3C7",
        border: "1px solid #F59E0B",
        borderRadius: 6,
        padding: "12px 16px",
        marginBottom: 16,
        fontSize: 13,
        color: "#92400E",
      }}>
        <strong>⚠️ Đang dùng mock data</strong> — BE Platform Service chưa deploy. Khi BE ready, page này sẽ wire vào{" "}
        <code style={{ background: "#FFF7CD", padding: "1px 6px", borderRadius: 3 }}>GET /api/v1/app</code> +{" "}
        <code style={{ background: "#FFF7CD", padding: "1px 6px", borderRadius: 3 }}>POST /api/v1/app</code>. Spec đầy đủ ở{" "}
        <code style={{ background: "#FFF7CD", padding: "1px 6px", borderRadius: 3 }}>docs/platform-service/05-API-Spec.md § 5.5b</code>.
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="🔍 Tìm theo tên / code…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 14 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          style={{ padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 14 }}
        >
          <option value="all">Status: Tất cả</option>
          <option value="active">Active</option>
          <option value="beta">Beta</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((app) => (
          <div
            key={app.code}
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              padding: 16,
              background: "#fff",
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div style={{
              width: 60, height: 60, borderRadius: 8, background: "#F3F4F6",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
            }}>
              {app.iconLabel}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <strong style={{ fontSize: 16 }}>{app.name}</strong>
                <code style={{ background: "#F3F4F6", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>
                  {app.code}
                </code>
                {app.status === "beta" && (
                  <span style={{ background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                    BETA
                  </span>
                )}
                {app.status === "archived" && (
                  <span style={{ background: "#FEE2E2", color: "#991B1B", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                    ARCHIVED
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                {app.editions.length} edition{app.editions.length > 1 ? "s" : ""}: {app.editions.join(", ")}
              </div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>
                {app.tenantsCount} tenant đang dùng • Order: {app.ordinal}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => navigate(`/app_management/${app.code}/edition`)}
                style={{ padding: "8px 16px", background: "#fff", color: "#0F766E", border: "1px solid #0F766E", borderRadius: 6, cursor: "pointer", fontWeight: 500 }}
              >
                Xem editions →
              </button>
              <button
                onClick={() => alert(`Sửa App ${app.code} — chờ BE Platform`)}
                style={{ padding: "8px 12px", background: "#fff", border: "1px solid #D1D5DB", borderRadius: 6, cursor: "pointer" }}
              >
                ✏️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "#9CA3AF" }}>
          Không tìm thấy app nào khớp filter.
        </div>
      )}
    </div>
  );
}
