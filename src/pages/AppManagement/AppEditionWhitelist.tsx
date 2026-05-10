import React from "react";
import { useNavigate, useParams } from "react-router-dom";

// Placeholder UC-13: whitelist tenant cho exclusive edition.
// Spec: docs/platform-service/11-UI-Design.md § 11.3.5.

const MOCK_WHITELIST = [
  {
    tenantId: 999,
    tenantAlias: "abc",
    tenantName: "Công ty ABC",
    grantedBy: "Phan Đức Dũng",
    grantedAt: "10/05/2026",
    notes: "Custom build per HĐ #2026-001",
  },
];

export default function AppEditionWhitelist() {
  const navigate = useNavigate();
  const { editionId } = useParams<{ editionId: string }>();

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
        <span style={{ color: "#0F766E", cursor: "pointer" }} onClick={() => navigate("/app_management/CRM/edition")}>CRM</span>
        <span style={{ color: "#9CA3AF", margin: "0 8px" }}>/</span>
        <span style={{ fontWeight: 600 }}>Whitelist edition #{editionId}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>WHITELIST TENANT</h1>
        <button
          onClick={() => alert("Modal Thêm tenant whitelist — chờ BE Platform")}
          style={{ padding: "10px 20px", background: "#0F766E", color: "#fff", border: 0, borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
        >
          + Thêm tenant
        </button>
      </div>

      <div style={{
        background: "#FEE2E2", border: "1px solid #DC2626", borderRadius: 6,
        padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#991B1B",
      }}>
        <strong>🔒 Edition exclusive</strong> — chỉ tenant trong danh sách dưới mới subscribe được. Mọi thao tác audit log đầy đủ.
      </div>

      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#F9FAFB" }}>
            <tr>
              <th style={th}>STT</th>
              <th style={th}>Tenant</th>
              <th style={th}>Cấp bởi</th>
              <th style={th}>Ngày cấp</th>
              <th style={th}>Ghi chú</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_WHITELIST.map((row, i) => (
              <tr key={row.tenantId} style={{ borderTop: "1px solid #E5E7EB" }}>
                <td style={td}>{i + 1}</td>
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{row.tenantName}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>alias: {row.tenantAlias}</div>
                </td>
                <td style={td}>{row.grantedBy}</td>
                <td style={td}>{row.grantedAt}</td>
                <td style={td}>{row.notes}</td>
                <td style={td}>
                  <button
                    onClick={() => {
                      if (confirm(`Revoke whitelist của ${row.tenantName}?`)) {
                        alert("Đã revoke (mock — chờ BE)");
                      }
                    }}
                    style={{ background: "none", border: 0, color: "#DC2626", cursor: "pointer", fontSize: 13 }}
                  >
                    🗑 Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#4B5563", textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "12px", fontSize: 14 };
