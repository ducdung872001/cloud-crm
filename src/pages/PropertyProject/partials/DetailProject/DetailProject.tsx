import React, { useState } from "react";
import { MOCK_UNITS, MOCK_LEASE_CONTRACTS, MOCK_INVOICES, MOCK_SERVICE_REQUESTS, STATUS_LABELS, STATUS_COLORS } from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${n?.toLocaleString("vi-VN")} đ`;

interface Props {
  project: any;
  onBack: () => void;
}

const TABS = [
  { key: "overview", label: "📋 Tổng quan" },
  { key: "units", label: "🏠 Danh sách Unit" },
  { key: "leases", label: "📄 Hợp đồng thuê" },
  { key: "invoices", label: "💳 Hóa đơn" },
  { key: "service_requests", label: "🔧 Yêu cầu DV" },
];

export default function DetailProject({ project, onBack }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  const projectUnits = MOCK_UNITS.filter((u) => u.projectId === project.id);
  const projectLeases = MOCK_LEASE_CONTRACTS.filter((c) => c.projectId === project.id);
  const projectInvoices = MOCK_INVOICES.filter((i) => i.projectId === project.id);
  const projectSRs = MOCK_SERVICE_REQUESTS.filter((s) => s.projectId === project.id);

  const totalRevenue = projectInvoices.filter(i => i.status === "paid").reduce((a, i) => a + i.paidAmount, 0);
  const overduePaid = projectInvoices.filter(i => i.status === "overdue");

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>← Quay lại</button>
        <div className="detail-title-block">
          <h1>{project.name}</h1>
          <p>📍 {project.location} &nbsp;|&nbsp; Mã: {project.code} &nbsp;|&nbsp; {project.typeName}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline">✏️ Chỉnh sửa</button>
          <button className="btn btn-primary">+ Thêm unit</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { icon: "🏠", label: "Tổng Unit", value: project.totalUnits, color: "#1890ff" },
          { icon: "✅", label: "Đang thuê", value: project.occupiedUnits, color: "#52c41a" },
          { icon: "📊", label: "Lấp đầy", value: `${project.occupancyRate}%`, color: project.occupancyRate >= 85 ? "#52c41a" : "#faad14" },
          { icon: "💰", label: "DT tháng", value: fmtMoney(totalRevenue), color: "#722ed1" },
          { icon: "⚠️", label: "Quá hạn TT", value: overduePaid.length, color: "#ff4d4f" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 24 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`detail-tab${activeTab === t.key ? " active" : ""}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="detail-content">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            <div className="info-grid">
              {[
                { label: "Mã dự án", value: project.code },
                { label: "Loại hình", value: project.typeName },
                { label: "Trạng thái", value: STATUS_LABELS[project.status] || project.status },
                { label: "Tổng diện tích", value: `${project.totalArea?.toLocaleString("vi-VN")} m²` },
                { label: "Chủ đầu tư", value: project.investorName },
                { label: "Quản lý DA", value: project.managerName },
                { label: "SĐT liên hệ", value: project.phone },
                { label: "Ngày bắt đầu", value: project.startDate },
                { label: "Địa chỉ", value: project.location },
              ].map((info, i) => (
                <div key={i} className="info-item">
                  <div className="info-item__label">{info.label}</div>
                  <div className="info-item__value">{info.value || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UNITS TAB */}
        {activeTab === "units" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ color: "#8c8c8c" }}>{projectUnits.length} unit</span>
              <button className="btn btn-primary">+ Thêm unit</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã Unit</th>
                  <th>Block</th>
                  <th>Tầng</th>
                  <th>Diện tích (m²)</th>
                  <th>Loại</th>
                  <th>Giá thuê / tháng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {projectUnits.map((u) => (
                  <tr key={u.id}>
                    <td><span className="code-text">{u.code}</span></td>
                    <td>{u.block}</td>
                    <td>Tầng {u.floor}</td>
                    <td>{u.area} m²</td>
                    <td>{u.unitType}</td>
                    <td className="amount-text">{fmtMoney(u.rentPrice)}</td>
                    <td>
                      <span className="status-badge" style={{ background: `${STATUS_COLORS[u.status]}22`, color: STATUS_COLORS[u.status] }}>
                        {STATUS_LABELS[u.status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="action-btn action-btn--edit">✏️</button>
                        <button className="action-btn action-btn--delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LEASES TAB */}
        {activeTab === "leases" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ color: "#8c8c8c" }}>{projectLeases.length} hợp đồng</span>
              <button className="btn btn-primary">+ Thêm hợp đồng</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã HĐ</th>
                  <th>Khách hàng</th>
                  <th>Unit</th>
                  <th>Loại HĐ</th>
                  <th>Hiệu lực</th>
                  <th>Phí thuê/tháng</th>
                  <th>Tiền cọc</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {projectLeases.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: "center", color: "#8c8c8c", padding: 24 }}>Chưa có hợp đồng</td></tr>
                )}
                {projectLeases.map((c) => (
                  <tr key={c.id}>
                    <td><span className="code-text">{c.code}</span></td>
                    <td>{c.customerName}</td>
                    <td><span className="code-text">{c.unitCode}</span></td>
                    <td>{c.contractType}</td>
                    <td style={{ fontSize: 12 }}>{c.startDate} → {c.endDate}</td>
                    <td className="amount-text">{fmtMoney(c.rentAmount)}</td>
                    <td className="amount-text">{fmtMoney(c.depositAmount)}</td>
                    <td>
                      <span className="status-badge" style={{ background: `${STATUS_COLORS[c.status]}22`, color: STATUS_COLORS[c.status] }}>
                        {STATUS_LABELS[c.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === "invoices" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ color: "#8c8c8c" }}>{projectInvoices.length} hóa đơn</span>
              <button className="btn btn-primary">+ Tạo hóa đơn</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã HĐ</th>
                  <th>Khách hàng</th>
                  <th>Kỳ</th>
                  <th>Hạn TT</th>
                  <th>Tổng tiền</th>
                  <th>Đã TT</th>
                  <th>Còn lại</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {projectInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td><span className="code-text">{inv.code}</span></td>
                    <td>{inv.customerName}</td>
                    <td>{inv.period}</td>
                    <td style={{ fontSize: 12 }}>{inv.dueDate}</td>
                    <td className="amount-text">{fmtMoney(inv.totalAmount)}</td>
                    <td className="amount-text" style={{ color: "#52c41a" }}>{fmtMoney(inv.paidAmount)}</td>
                    <td className="amount-text" style={{ color: inv.totalAmount - inv.paidAmount > 0 ? "#ff4d4f" : "#52c41a" }}>
                      {fmtMoney(inv.totalAmount - inv.paidAmount)}
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: `${STATUS_COLORS[inv.status]}22`, color: STATUS_COLORS[inv.status] }}>
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SERVICE REQUESTS TAB */}
        {activeTab === "service_requests" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ color: "#8c8c8c" }}>{projectSRs.length} yêu cầu</span>
              <button className="btn btn-primary">+ Tạo yêu cầu</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã SR</th>
                  <th>Loại</th>
                  <th>Tiêu đề</th>
                  <th>Ưu tiên</th>
                  <th>NCC xử lý</th>
                  <th>Tạo lúc</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {projectSRs.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: "#8c8c8c", padding: 24 }}>Không có yêu cầu</td></tr>
                )}
                {projectSRs.map((sr) => (
                  <tr key={sr.id}>
                    <td><span className="code-text">{sr.code}</span></td>
                    <td>{sr.category}</td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sr.title}</td>
                    <td>
                      <span style={{ color: sr.priority === "urgent" ? "#ff4d4f" : sr.priority === "high" ? "#fa8c16" : "#1890ff", fontWeight: 600 }}>
                        {sr.priority === "urgent" ? "🔴 Khẩn cấp" : sr.priority === "high" ? "🟠 Cao" : "🔵 Thường"}
                      </span>
                    </td>
                    <td>{sr.assignedVendorName || "—"}</td>
                    <td style={{ fontSize: 12 }}>{sr.createdAt?.split(" ")[0]}</td>
                    <td>
                      <span className="status-badge" style={{ background: `${STATUS_COLORS[sr.status]}22`, color: STATUS_COLORS[sr.status] }}>
                        {STATUS_LABELS[sr.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
