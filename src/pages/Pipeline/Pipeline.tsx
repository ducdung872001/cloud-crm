import React from "react";
import { useApp } from "contexts/AppContext";
import { MOCK_DEALS } from "configs/mockData";

const STAGES = [
  { key: "approach",  label: "Tiếp cận",             color: "var(--accent-bright)", count: 8 },
  { key: "consult",   label: "Tư vấn",               color: "var(--gold)",          count: 5 },
  { key: "proposal",  label: "Lập hồ sơ / Đề xuất", color: "var(--purple)",        count: 4 },
  { key: "appraisal", label: "Thẩm định & Duyệt",   color: "var(--warning)",       count: 2 },
  { key: "closing",   label: "Chốt / Ký HĐ",         color: "var(--success)",       count: 3 },
];

export default function Pipeline() {
  const { openModal, showToast } = useApp();

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Pipeline & Cơ hội</div>
          <div className="page-subtitle">Quản lý cơ hội bán hàng theo giai đoạn</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => openModal("modal-pipeline-filter")}>
            <svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Lọc
          </button>
          <button className="btn btn--primary" onClick={() => openModal("modal-new-opportunity")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo cơ hội
          </button>
        </div>
      </div>

      <div className="metric-grid">
        {[
          { color: "blue",  value: "11",      label: "Cơ hội đang mở",     icon: <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
          { color: "gold",  value: "42.8 tỷ", label: "Tổng giá trị pipeline", icon: <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
          { color: "green", value: "3",       label: "Sắp chốt (tuần này)", icon: <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
          { color: "red",   value: "14.2 ngày", label: "Thời gian TB pipeline", icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
        ].map((m) => (
          <div key={m.label} className={`metric-card metric-card--${m.color}`}>
            <div className="metric-card__top">
              <div className={`metric-card__icon metric-card__icon--${m.color}`}>{m.icon}</div>
            </div>
            <div className="metric-card__value">{m.value}</div>
            <div className="metric-card__label">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: "visible" }}>
        <div className="card__header">
          <span className="card__title">Kanban Pipeline</span>
          <div style={{ display: "flex", gap: 8 }}>
            <select className="filter-select">
              <option>Tất cả sản phẩm</option><option>Vay</option><option>Thẻ</option>
              <option>Tiết kiệm</option><option>Banca</option>
            </select>
            <select className="filter-select">
              <option>Tất cả RM</option><option>Hà Thu</option><option>Trần Nguyên</option>
              <option>Ngọc Anh</option><option>Minh Quân</option>
            </select>
          </div>
        </div>
        <div style={{ padding: "14px 18px" }}>
          <div className="pipeline-wrap">
            {STAGES.map((stage) => {
              const deals = MOCK_DEALS.filter((d) => d.stage === stage.key);
              return (
                <div key={stage.key} className="pipeline-col">
                  <div className="pipeline-stage" style={{ color: stage.color }}>
                    {stage.label}
                    <span className="stage-count">{stage.count}</span>
                  </div>
                  {deals.map((d) => (
                    <div
                      key={d.id}
                      className={`deal-card${d.highlight === "won" ? " deal-card--won-border" : d.highlight === "pending" ? " deal-card--pending-border" : ""}`}
                      onClick={() => openModal("modal-deal-detail")}
                    >
                      <div className="deal-card__name">{d.name}</div>
                      <div className="deal-card__meta">{d.meta}</div>
                      <div className="deal-card__amount">{d.amount}</div>
                      <div className="deal-card__footer">
                        <span className={`deal-product deal-product--${d.product}`}>{d.productLabel}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div className="deal-card__avatar" style={{ background: d.rmColor }}>{d.rmInitials}</div>
                          <span className="deal-card__date">{d.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div
                    className="pipeline-add-btn"
                    onClick={() => openModal("modal-new-opportunity")}
                  >+ Thêm cơ hội</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
