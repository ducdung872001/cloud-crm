import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AppManagement.scss";

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
    { id: 1,  code: "CRM-SPA",     name: "CRM Thẩm mỹ",       industry: "Spa & Thẩm mỹ", urlSuffix: "/crm-spa",     visibility: "public",    isDefaultForIndustry: true,  status: "active", gitBranch: "reborn-tech",    tenantsCount: 12 },
    { id: 2,  code: "CRM-REALTY",  name: "CRM Bất động sản",   industry: "Bất động sản",  urlSuffix: "/crm-realty",  visibility: "public",    isDefaultForIndustry: true,  status: "beta",   gitBranch: "reborn-realty",  tenantsCount: 1 },
    { id: 3,  code: "CRM-EDU",     name: "CRM Giáo dục",       industry: "Giáo dục",     urlSuffix: "/crm-edu",     visibility: "public",    isDefaultForIndustry: true,  status: "active", gitBranch: "mentorhub",      tenantsCount: 8 },
    { id: 4,  code: "CRM-LOYALTY", name: "CRM Loyalty",        industry: "Bán lẻ",       urlSuffix: "/crm-loyalty", visibility: "public",    isDefaultForIndustry: true,  status: "active", gitBranch: "reborn-loyalty", tenantsCount: 3 },
    { id: 5,  code: "CRM-GENERIC", name: "CRM Tiêu chuẩn",     industry: null,           urlSuffix: "/crm",         visibility: "public",    isDefaultForIndustry: false, status: "active", gitBranch: "reborn-tech",    tenantsCount: 24 },
    { id: 50, code: "CRM-ABC-VIP", name: "CRM ABC (custom)",   industry: null,           urlSuffix: "/x-abc-7f2e1", visibility: "exclusive", isDefaultForIndustry: false, status: "active", gitBranch: "crm-abc-custom", tenantsCount: 1, whitelistCount: 1 },
  ],
  BPM: [
    { id: 10, code: "BPM-GENERIC", name: "BPM Tiêu chuẩn", industry: null, urlSuffix: "/bpm", visibility: "public", isDefaultForIndustry: false, status: "active", gitBranch: "(chưa cấu hình)", tenantsCount: 12 },
  ],
  CXM: [
    { id: 11, code: "CXM-GENERIC", name: "CXM Tiêu chuẩn", industry: null, urlSuffix: "/cxm", visibility: "public", isDefaultForIndustry: false, status: "beta", gitBranch: "(chưa cấu hình)", tenantsCount: 0 },
  ],
  POS: [
    { id: 20, code: "POS-FNB",     name: "POS Nhà hàng & Ăn uống", industry: "Nhà hàng & Ăn uống", urlSuffix: "/pos-fnb",    visibility: "public", isDefaultForIndustry: true,  status: "beta",   gitBranch: "(chưa cấu hình)", tenantsCount: 3 },
    { id: 21, code: "POS-RETAIL",  name: "POS Bán lẻ",             industry: "Bán lẻ",            urlSuffix: "/pos-retail", visibility: "public", isDefaultForIndustry: false, status: "beta",   gitBranch: "(chưa cấu hình)", tenantsCount: 1 },
    { id: 22, code: "POS-GENERIC", name: "POS Tiêu chuẩn",         industry: null,                urlSuffix: "/pos",        visibility: "public", isDefaultForIndustry: false, status: "active", gitBranch: "(chưa cấu hình)", tenantsCount: 1 },
  ],
  SUPERADMIN: [
    { id: 99, code: "SUPERADMIN-GENERIC", name: "Reborn Super Admin Console", industry: null, urlSuffix: "/superadmin", visibility: "public", isDefaultForIndustry: false, status: "active", gitBranch: "reborn-superadmin", tenantsCount: 1 },
  ],
};

export default function AppEditionList() {
  const navigate = useNavigate();
  const { appCode } = useParams<{ appCode: string }>();
  const editions = useMemo(() => MOCK_EDITIONS[appCode || ""] || [], [appCode]);

  return (
    <div className="app-management">
      <div className="am-breadcrumb">
        <button className="am-breadcrumb-link" onClick={() => navigate("/app_management")}>
          ◀ Quản lý ứng dụng
        </button>
        <span className="am-breadcrumb-sep">/</span>
        <span className="am-breadcrumb-current">{appCode}</span>
      </div>

      <div className="am-header">
        <h1>Các phiên bản của {appCode}</h1>
        <button className="am-btn-primary" onClick={() => alert("Modal Thêm Edition — chờ BE Platform")}>
          + Thêm Edition
        </button>
      </div>

      <div className="am-mock-banner">
        ⚠️ <strong>Mock data</strong> — sẽ wire vào <code>GET /api/v1/app/{appCode}/edition?show=all</code>.
      </div>

      <div className="am-card-list">
        {editions.map((ed) => (
          <div key={ed.id} className="am-card am-edition-card">
            <div className="am-edition-tags">
              <span className="am-tag-code">{ed.code}</span>
              <span className={`am-tag am-tag-${ed.visibility}`}>{ed.visibility}</span>
              {ed.isDefaultForIndustry && <span className="am-tag am-tag-default">⭐ Mặc định</span>}
              {ed.status === "beta" && <span className="am-tag am-tag-beta">Beta</span>}
              {ed.status === "deprecated" && <span className="am-tag am-tag-deprecated">Deprecated</span>}
            </div>

            <div className="am-edition-name">{ed.name}</div>

            <div className="am-edition-grid">
              <div>
                <strong>Lĩnh vực:</strong> {ed.industry ?? <em>(neutral)</em>}
              </div>
              <div>
                <strong>URL suffix:</strong> <code>{ed.urlSuffix}</code>
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

            <div className="am-edition-actions">
              <button className="am-btn-secondary" onClick={() => alert(`Sửa edition ${ed.code} — chờ BE`)}>
                ✏️ Sửa
              </button>
              {ed.status === "beta" && (
                <button className="am-btn-secondary" onClick={() => alert(`Promote ${ed.code} → active — chờ BE`)}>
                  ✅ Promote → active
                </button>
              )}
              {ed.visibility === "exclusive" && (
                <button className="am-btn-secondary" onClick={() => navigate(`/app_management/edition/${ed.id}/whitelist`)}>
                  👁 Xem whitelist
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editions.length === 0 && (
        <div className="am-empty">
          App <code>{appCode}</code> chưa có edition nào.
        </div>
      )}
    </div>
  );
}
