import React, { useState } from "react";
import { useApp } from "contexts/AppContext";
import { MOCK_LEADS } from "configs/mockData";

export default function LeadManagement() {
  const { setActivePage, openModal, showToast } = useApp();
  const [filter, setFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");

  const filtered = MOCK_LEADS.filter((l) => {
    const statusOk = filter === "all" || l.status === filter;
    const productOk = productFilter === "all" || l.product === productFilter;
    return statusOk && productOk;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Lead Management</div>
          <div className="page-subtitle">Quản lý khách hàng tiềm năng – Banking</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => openModal("modal-import-lead")}>
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import Lead
          </button>
          <button className="btn btn--primary" onClick={() => openModal("modal-new-lead")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo Lead mới
          </button>
        </div>
      </div>

      <div className="metric-grid">
        {[
          { color: "blue", icon: <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>, trend: "↑ 18%", trendDir: "up", value: "247", label: "Tổng Leads tháng" },
          { color: "gold", icon: <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, trend: "↑ 7%", trendDir: "up", value: "84", label: "Chuyển đổi thành deal" },
          { color: "green", icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, trend: "2.4 ngày", trendDir: "warn", value: "2.4 ngày", label: "Phản hồi trung bình" },
          { color: "red", icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>, trend: "↑ 3%", trendDir: "down", value: "28", label: "Lead unqualified" },
        ].map((m) => (
          <div key={m.label} className={`metric-card metric-card--${m.color}`}>
            <div className="metric-card__top">
              <div className={`metric-card__icon metric-card__icon--${m.color}`}>{m.icon}</div>
              <span className={`metric-card__trend metric-card__trend--${m.trendDir}`}>{m.trend}</span>
            </div>
            <div className="metric-card__value">{m.value}</div>
            <div className="metric-card__label">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-row">
        {[
          { key: "all", label: "Tất cả (247)" },
          { key: "hot", label: "🔥 Nóng (42)" },
          { key: "warm", label: "🌤 Ấm (98)" },
          { key: "cold", label: "❄ Lạnh (107)" },
        ].map((f) => (
          <div
            key={f.key}
            className={`filter-chip${filter === f.key ? " filter-chip--active" : ""}`}
            onClick={() => setFilter(f.key)}
          >{f.label}</div>
        ))}
        <select className="filter-select" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
          <option value="all">Tất cả sản phẩm</option>
          <option value="vay">Vay tài sản</option>
          <option value="sme">Vay doanh nghiệp</option>
          <option value="the">Thẻ tín dụng</option>
          <option value="tk">Tiết kiệm</option>
          <option value="banca">Bancassurance</option>
        </select>
        <select className="filter-select">
          <option>Tất cả nguồn</option>
          <option>Web/App</option>
          <option>Referral</option>
          <option>Telesale</option>
          <option>Chi nhánh</option>
        </select>
      </div>

      <div className="card">
        <div className="card__body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Giá trị</th>
                <th>Nguồn</th>
                <th>RM phụ trách</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} onClick={() => setActivePage("customers")}>
                  <td>
                    <div className="td-name">{lead.name}</div>
                    <div className="td-sub">{lead.type === "corporate" ? "Doanh nghiệp" : lead.phone} · {lead.address}</div>
                  </td>
                  <td><span className={`deal-product deal-product--${lead.product}`}>{lead.productLabel}</span></td>
                  <td style={{ fontWeight: 700, color: "var(--accent-bright)" }}>{lead.value}</td>
                  <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{lead.source}</td>
                  <td style={{ fontSize: 12 }}>{lead.rm}</td>
                  <td>
                    <span className={`status-badge status-badge--${lead.status}`}>
                      {lead.status === "hot" ? "Nóng" : lead.status === "warm" ? "Ấm" : "Lạnh"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{lead.date}</td>
                  <td>
                    <button
                      className="btn-icon-sm"
                      onClick={(e) => { e.stopPropagation(); openModal("modal-new-opportunity"); }}
                    >Tạo deal</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
