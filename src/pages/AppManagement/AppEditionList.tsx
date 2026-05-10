import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Placeholder cho UC-12: list edition của 1 app.
// Spec: docs/platform-service/11-UI-Design.md § 11.3.3.

type EditionRow = {
  id: number;
  code: string;
  name: string;
  industry: string | null;
  urlSuffix: string;
  visibility: "public" | "private" | "exclusive";
  isDefaultForIndustry: boolean;
  status: "beta" | "active" | "deprecated" | "archived";
  gitBranch: string;
  tenantsCount: number;
  whitelistCount?: number;
};

const MOCK_EDITIONS: Record<string, EditionRow[]> = {
  CRM: [
    { id: 1, code: "CRM-SPA", name: "CRM Thẩm mỹ", industry: "Spa & Thẩm mỹ", urlSuffix: "/crm-spa", visibility: "public", isDefaultForIndustry: true, status: "active", gitBranch: "reborn-tech", tenantsCount: 12 },
    { id: 2, code: "CRM-REALTY", name: "CRM Bất động sản", industry: "Bất động sản", urlSuffix: "/crm-realty", visibility: "public", isDefaultForIndustry: true, status: "beta", gitBranch: "reborn-realty", tenantsCount: 1 },
    { id: 3, code: "CRM-EDU", name: "CRM Giáo dục", industry: "Giáo dục", urlSuffix: "/crm-edu", visibility: "public", isDefaultForIndustry: true, status: "active", gitBranch: "mentorhub", tenantsCount: 8 },
    { id: 4, code: "CRM-LOYALTY", name: "CRM Loyalty (chuỗi bán lẻ)", industry: "Bán lẻ", urlSuffix: "/crm-loyalty", visibility: "public", isDefaultForIndustry: true, status: "active", gitBranch: "reborn-loyalty", tenantsCount: 3 },
    { id: 5, code: "CRM-GENERIC", name: "CRM Tiêu chuẩn", industry: null, urlSuffix: "/crm", visibility: "public", isDefaultForIndustry: false, status: "active", gitBranch: "reborn-tech", tenantsCount: 24 },
    { id: 50, code: "CRM-ABC-VIP", name: "CRM ABC (custom)", industry: null, urlSuffix: "/x-abc-7f2e1", visibility: "exclusive", isDefaultForIndustry: false, status: "active", gitBranch: "crm-abc-custom", tenantsCount: 1, whitelistCount: 1 },
  ],
  BPM: [
    { id: 10, code: "BPM-GENERIC", name: "BPM Tiêu chuẩn", industry: null, urlSuffix: "/bpm", visibility: "public", isDefaultForIndustry: false, status: "active", gitBranch: "(chưa cấu hình)", tenantsCount: 12 },
  ],
  CXM: [
    { id: 11, code: "CXM-GENERIC", name: "CXM Tiêu chuẩn", industry: null, urlSuffix: "/cxm", visibility: "public", isDefaultForIndustry: false, status: "beta", gitBranch: "(chưa cấu hình)", tenantsCount: 0 },
  ],
  POS: [
    { id: 20, code: "POS-FNB", name: "POS Nhà hàng & Ăn uống", industry: "Nhà hàng & Ăn uống", urlSuffix: "/pos-fnb", visibility: "public", isDefaultForIndustry: true, status: "beta", gitBranch: "(chưa cấu hình)", tenantsCount: 3 },
    { id: 21, code: "POS-RETAIL", name: "POS Bán lẻ", industry: "Bán lẻ", urlSuffix: "/pos-retail", visibility: "public", isDefaultForIndustry: false, status: "beta", gitBranch: "(chưa cấu hình)", tenantsCount: 1 },
    { id: 22, code: "POS-GENERIC", name: "POS Tiêu chuẩn", industry: null, urlSuffix: "/pos", visibility: "public", isDefaultForIndustry: false, status: "active", gitBranch: "(chưa cấu hình)", tenantsCount: 1 },
  ],
  SUPERADMIN: [
    { id: 99, code: "SUPERADMIN-GENERIC", name: "Reborn Super Admin Console", industry: null, urlSuffix: "/superadmin", visibility: "public", isDefaultForIndustry: false, status: "active", gitBranch: "reborn-superadmin", tenantsCount: 1 },
  ],
};

const visibilityBadge: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  public:    { icon: "🌐", color: "#065F46", bg: "#D1FAE5", label: "public" },
  private:   { icon: "🔓", color: "#92400E", bg: "#FEF3C7", label: "private" },
  exclusive: { icon: "🔒", color: "#991B1B", bg: "#FEE2E2", label: "exclusive" },
};

export default function AppEditionList() {
  const navigate = useNavigate();
  const { appCode } = useParams<{ appCode: string }>();
  const editions = useMemo(() => MOCK_EDITIONS[appCode || ""] || [], [appCode]);

  return (
    <div style={{ padding: "24px 32px" }}>
      <div style={{ marginBottom: 8 }}>
        <button
          onClick={() => navigate("/app_management")}
          style={{ background: "none", border: 0, color: "#0F766E", cursor: "pointer", padding: 0, fontSize: 14 }}
        >
          ◀ Quản lý ứng dụng
        </button>
        <span style={{ color: "#9CA3AF", margin: "0 8px" }}>/</span>
        <span style={{ fontWeight: 600 }}>{appCode}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>CÁC PHIÊN BẢN CỦA {appCode}</h1>
        <button
          onClick={() => alert("Modal Thêm Edition — chờ BE Platform")}
          style={{ padding: "10px 20px", background: "#0F766E", color: "#fff", border: 0, borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
        >
          + Thêm Edition
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
        <strong>⚠️ Mock data</strong> — BE chưa deploy. Sẽ wire vào{" "}
        <code style={{ background: "#FFF7CD", padding: "1px 6px", borderRadius: 3 }}>
          GET /api/v1/app/{appCode}/edition?show=all
        </code>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {editions.map((ed) => {
          const vb = visibilityBadge[ed.visibility];
          return (
            <div
              key={ed.id}
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                padding: 16,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <code style={{ background: "#F3F4F6", padding: "3px 10px", borderRadius: 4, fontSize: 13, fontWeight: 600 }}>
                  {ed.code}
                </code>
                <span style={{ background: vb.bg, color: vb.color, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                  {vb.icon} {vb.label}
                </span>
                {ed.isDefaultForIndustry && (
                  <span style={{ background: "#DBEAFE", color: "#1E40AF", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                    ⭐ default
                  </span>
                )}
                {ed.status === "beta" && (
                  <span style={{ background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                    BETA
                  </span>
                )}
                {ed.status === "deprecated" && (
                  <span style={{ background: "#FEE2E2", color: "#991B1B", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                    DEPRECATED
                  </span>
                )}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{ed.name}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "#4B5563", marginBottom: 8 }}>
                <div>
                  <strong>Industry:</strong> {ed.industry ?? <em style={{ color: "#9CA3AF" }}>(neutral)</em>}
                </div>
                <div>
                  <strong>URL suffix:</strong> <code style={{ background: "#F3F4F6", padding: "1px 6px", borderRadius: 3 }}>{ed.urlSuffix}</code>
                </div>
                <div>
                  <strong>Git branch:</strong> {ed.gitBranch}
                </div>
                <div>
                  <strong>Tenant đang dùng:</strong> {ed.tenantsCount}
                  {ed.visibility === "exclusive" && ed.whitelistCount !== undefined && (
                    <> • Whitelist: {ed.whitelistCount}</>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => alert(`Sửa edition ${ed.code} — chờ BE`)}
                  style={{ padding: "6px 12px", background: "#fff", border: "1px solid #D1D5DB", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                >
                  ✏️ Sửa
                </button>
                {ed.status === "beta" && (
                  <button
                    onClick={() => alert(`Promote ${ed.code} → active — chờ BE`)}
                    style={{ padding: "6px 12px", background: "#fff", border: "1px solid #10B981", color: "#065F46", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                  >
                    ✅ Promote → active
                  </button>
                )}
                {ed.visibility === "exclusive" && (
                  <button
                    onClick={() => navigate(`/app_management/edition/${ed.id}/whitelist`)}
                    style={{ padding: "6px 12px", background: "#fff", border: "1px solid #D1D5DB", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                  >
                    👁 Xem whitelist
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editions.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "#9CA3AF" }}>
          App <code>{appCode}</code> chưa có edition nào. Click "Thêm Edition" để tạo.
        </div>
      )}
    </div>
  );
}
