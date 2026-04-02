import React, { useState } from "react";
import { useApp } from "contexts/AppContext";
import { MOCK_CAMPAIGNS } from "configs/mockData";

export default function Campaigns() {
  const { openModal, setActivePage, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});

  const getTab = (id: string) => activeTab[id] || "docs";
  const setTab = (id: string, tab: string) => setActiveTab((prev) => ({ ...prev, [id]: tab }));

  const statusBadge = (s: string) => {
    if (s === "active")
      return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--success-soft)", color: "var(--success)", fontWeight: 600 }}>● Đang chạy</span>;
    if (s === "upcoming")
      return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--warning-soft)", color: "var(--warning)", fontWeight: 600 }}>○ Sắp bắt đầu</span>;
    return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--surface)", color: "var(--text-muted)", fontWeight: 600 }}>✓ Kết thúc</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Chiến dịch</div>
          <div className="page-subtitle">Quản lý chiến dịch bán hàng Banking</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => showToast("Đang xuất báo cáo...", "info")}>
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Xuất báo cáo
          </button>
          <button className="btn btn--primary" onClick={() => openModal("modal-new-campaign")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo chiến dịch
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="metric-grid">
        {[
          { color: "green",  value: "2",       label: "Đang chạy",         trend: "Active",  icon: <svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg> },
          { color: "gold",   value: "62.4 tỷ", label: "Tổng DS chiến dịch",trend: "↑ 23%",  icon: <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
          { color: "blue",   value: "247",      label: "Leads phát sinh",   trend: "↑ 18%",  icon: <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
          { color: "purple", value: "84",       label: "Hợp đồng ký kết",  trend: "34% CVR",icon: <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
        ].map((m) => (
          <div key={m.label} className={`metric-card metric-card--${m.color}`}>
            <div className="metric-card__top">
              <div className={`metric-card__icon metric-card__icon--${m.color}`}>{m.icon}</div>
              <span className="metric-card__trend metric-card__trend--up">{m.trend}</span>
            </div>
            <div className="metric-card__value">{m.value}</div>
            <div className="metric-card__label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Campaign cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {MOCK_CAMPAIGNS.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{
              borderColor: c.borderColor || undefined,
              opacity: c.status === "upcoming" ? 0.85 : 1,
            }}
          >
            <div style={{ padding: "16px 20px" }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{c.emoji} {c.name}</span>
                    {statusBadge(c.status)}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>
                    {c.period} · Sản phẩm: {c.product} · Phạm vi: {c.scope}
                  </div>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Mục tiêu DS</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: c.pctColor }}>{c.targetRevenue}</div>
                    </div>
                    {c.actualCustomers > 0 && (
                      <div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Đã đạt</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--success)" }}>{c.actualRevenue}</div>
                      </div>
                    )}
                    {c.contractsSigned > 0 && (
                      <div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>HĐ ký</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>{c.contractsSigned}</div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>KH mục tiêu</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{c.targetCustomers}</div>
                    </div>
                  </div>
                  {c.pct > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                        <span style={{ color: "var(--text-secondary)" }}>Tiến độ</span>
                        <span style={{ fontWeight: 600, color: c.pctColor }}>{c.pct}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: 6 }}>
                        <div className="progress-bar__fill" style={{ width: `${c.pct}%`, background: c.pctColor }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  <button className="btn btn--primary btn--sm" onClick={() => openModal("modal-campaign-detail")}>
                    Chi tiết & Tài liệu
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => openModal("modal-campaign-edit")}>
                    Chỉnh sửa
                  </button>
                  {c.status === "active" && (
                    <button className="btn btn--ghost btn--sm" onClick={() => setActivePage("pipeline")}>
                      Xem Pipeline
                    </button>
                  )}
                  {c.status === "upcoming" && (
                    <button className="btn btn--ghost btn--sm" onClick={() => showToast("Chiến dịch đã được kích hoạt!", "success")}>
                      Kích hoạt
                    </button>
                  )}
                </div>
              </div>

              {/* Detail tabs (for active campaigns) */}
              {c.status === "active" && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 12, background: "var(--surface)", padding: 3, borderRadius: 9 }}>
                    {["docs", "kpi", "process"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setTab(c.id, tab)}
                        style={{
                          flex: 1, padding: "5px 8px", borderRadius: 7, border: "none",
                          fontFamily: "var(--font)", fontSize: 12, fontWeight: 500, cursor: "pointer",
                          background: getTab(c.id) === tab ? "var(--navy-mid)" : "none",
                          color: getTab(c.id) === tab ? "var(--text-primary)" : "var(--text-secondary)",
                          transition: "all .15s",
                        }}
                      >
                        {tab === "docs" ? `Tài liệu (${c.docs.length})` : tab === "kpi" ? "KPI" : "Quy trình"}
                      </button>
                    ))}
                  </div>

                  {getTab(c.id) === "docs" && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      {c.docs.map((doc) => (
                        <span key={doc} className="doc-chip" onClick={() => openModal("modal-view-doc")}>📄 {doc}</span>
                      ))}
                      <span className="doc-chip" style={{ borderStyle: "dashed", color: "var(--text-muted)" }} onClick={() => openModal("modal-new-doc")}>
                        + Thêm
                      </span>
                    </div>
                  )}

                  {getTab(c.id) === "kpi" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                      {[
                        { l: "Doanh số", v: c.actualRevenue, s: `/ ${c.targetRevenue}`, color: "var(--success)" },
                        { l: "Leads",    v: String(c.actualCustomers), s: `/ ${c.targetCustomers} KH`, color: "var(--accent-bright)" },
                        { l: "HĐ ký",   v: String(c.contractsSigned), s: `${c.targetCustomers > 0 ? Math.round(c.contractsSigned/c.targetCustomers*100) : 0}% CVR`, color: "var(--gold)" },
                        { l: "Tiến độ", v: `${c.pct}%`, s: "hoàn thành", color: c.pctColor },
                      ].map((item) => (
                        <div key={item.l} style={{ background: "var(--surface)", borderRadius: 8, padding: 10, textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 3 }}>{item.l}</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.v}</div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{item.s}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {getTab(c.id) === "process" && (
                    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                      {["Tiếp cận", "Tư vấn", "Đề xuất", "Thẩm định", "Chốt HĐ"].map((step, i) => (
                        <React.Fragment key={step}>
                          <div style={{ flexShrink: 0, background: "var(--surface)", borderRadius: 8, padding: "10px 14px", fontSize: 12, textAlign: "center", borderLeft: `3px solid ${["var(--accent)","var(--gold)","var(--purple)","var(--warning)","var(--success)"][i]}` }}>
                            <div style={{ fontWeight: 600, color: ["var(--accent-bright)","var(--gold)","var(--purple)","var(--warning)","var(--success)"][i] }}>{step}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: 10, marginTop: 2 }}>{[3,4,3,2,2][i]} tasks</div>
                          </div>
                          {i < 4 && <div style={{ alignSelf: "center", color: "var(--text-muted)", flexShrink: 0 }}>›</div>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Docs strip for non-active */}
              {c.status !== "active" && c.docs.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginRight: 4 }}>Tài liệu:</div>
                  {c.docs.map((doc) => (
                    <span key={doc} className="doc-chip" onClick={() => openModal("modal-view-doc")}>📄 {doc}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
