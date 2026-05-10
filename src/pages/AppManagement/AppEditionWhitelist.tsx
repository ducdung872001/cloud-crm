import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AppManagement.scss";

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
    <div className="app-management">
      <div className="am-breadcrumb">
        <button className="am-breadcrumb-link" onClick={() => navigate("/app_management")}>
          ◀ Quản lý ứng dụng
        </button>
        <span className="am-breadcrumb-sep">/</span>
        <button className="am-breadcrumb-link" onClick={() => navigate("/app_management/CRM/edition")}>
          CRM
        </button>
        <span className="am-breadcrumb-sep">/</span>
        <span className="am-breadcrumb-current">Whitelist edition #{editionId}</span>
      </div>

      <div className="am-header">
        <h1>Whitelist tenant</h1>
        <button className="am-btn-primary" onClick={() => alert("Modal Thêm tenant whitelist — chờ BE Platform")}>
          + Thêm tenant
        </button>
      </div>

      <div className="am-exclusive-banner">
        🔒 <strong>Edition exclusive</strong> — chỉ tenant trong danh sách dưới mới subscribe được. Mọi thao tác audit log đầy đủ.
      </div>

      <div className="am-table-wrap">
        <table className="am-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>STT</th>
              <th>Tenant</th>
              <th>Cấp bởi</th>
              <th style={{ width: 130 }}>Ngày cấp</th>
              <th>Ghi chú</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_WHITELIST.map((row, i) => (
              <tr key={row.tenantId}>
                <td>{i + 1}</td>
                <td>
                  <div className="am-table-name">{row.tenantName}</div>
                  <div className="am-table-sub">{row.tenantAlias}.reborn.vn</div>
                </td>
                <td>{row.grantedBy}</td>
                <td>{row.grantedAt}</td>
                <td>{row.notes}</td>
                <td>
                  <button
                    className="am-btn-danger"
                    onClick={() => {
                      if (confirm(`Revoke whitelist của ${row.tenantName}?`)) {
                        alert("Đã revoke (mock — chờ BE)");
                      }
                    }}
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
