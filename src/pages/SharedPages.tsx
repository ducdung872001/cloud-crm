import React, { useState } from "react";
import { useApp } from "contexts/AppContext";
import { MOCK_DOCS, MOCK_TASKS, MOCK_CUSTOMERS, MOCK_APPROVALS } from "configs/mockData";

// ─────────────────────────────────────────────────────────────────────────────
// SALES DOCS PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function SalesDocs() {
  const { openModal, showToast } = useApp();
  const [docFilter, setDocFilter] = useState("all");
  const filtered = MOCK_DOCS.filter((d) => docFilter === "all" || d.type === docFilter);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Tài liệu bán hàng</div>
          <div className="page-subtitle">Thư viện script, brochure & biểu mẫu cho RM</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => showToast("Tải xuống toàn bộ thư viện", "info")}>
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Tải tất cả
          </button>
          <button className="btn btn--primary" onClick={() => openModal("modal-new-doc")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Upload tài liệu
          </button>
        </div>
      </div>

      <div className="filter-row">
        {[
          { key: "all", label: "Tất cả" },
          { key: "script", label: "📄 Script tư vấn" },
          { key: "rate", label: "📊 Bảng phí / Lãi suất" },
          { key: "brochure", label: "🖼 Brochure" },
          { key: "form", label: "📋 Mẫu biểu" },
        ].map((f) => (
          <div
            key={f.key}
            className={`filter-chip${docFilter === f.key ? " filter-chip--active" : ""}`}
            onClick={() => setDocFilter(f.key)}
          >
            {f.label}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {filtered.map((doc) => (
          <div key={doc.id} className="doc-card" onClick={() => openModal("modal-view-doc")}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div className="doc-card__icon" style={{ background: doc.tagColor }}>{doc.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="doc-card__name">{doc.name}</div>
                <div className="doc-card__meta">{doc.size} · Cập nhật {doc.updated}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  <span className="doc-tag-chip" style={{ background: doc.tagColor, color: doc.tagTextColor }}>
                    {doc.type === "script" ? "Script" : doc.type === "rate" ? "Biểu phí" : doc.type === "brochure" ? "Brochure" : "Mẫu biểu"}
                  </span>
                  <span className="doc-tag-chip" style={{ background: doc.productColor, color: doc.productTextColor }}>{doc.product}</span>
                </div>
              </div>
            </div>
            <div className="doc-card__actions">
              <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); openModal("modal-view-doc"); }}>Xem</button>
              <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); showToast("Đã tải xuống tài liệu", "success"); }}>Tải</button>
              <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); showToast("Đã chia sẻ link cho KH", "success"); }}>Chia sẻ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER 360 PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function Customer360() {
  const { openModal, showToast } = useApp();
  const [activeKh, setActiveKh] = useState(0);
  const kh = MOCK_CUSTOMERS[activeKh];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Customer 360°</div>
          <div className="page-subtitle">Hồ sơ khách hàng toàn diện – cá nhân & doanh nghiệp</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => openModal("modal-new-lead")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm KH mới
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        {/* Customer list */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="card__header">
            <span className="card__title">Danh sách KH</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>3 KH</span>
          </div>
          <div style={{ padding: "6px 0" }}>
            {MOCK_CUSTOMERS.map((c, i) => (
              <div
                key={c.id}
                className={`kh-item${i === activeKh ? " kh-active" : ""}`}
                onClick={() => setActiveKh(i)}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#1565C0,var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>{c.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{c.typeLabel} · {c.rmCode}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer detail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Header */}
          <div className="card">
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#1565C0,var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", flexShrink: 0 }}>{kh.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{kh.name}</div>
                  <span className={`c360-type c360-type--${kh.type}`}>
                    {kh.type === "vip" ? "★ " : ""}{kh.typeLabel}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                  {kh.phone} · {kh.email} · {kh.address}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <button className="btn btn--primary btn--sm" onClick={() => showToast("Đang kết nối tổng đài...", "info")}>
                    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 6.18a2 2 0 012-2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.91 10a16 16 0 006.29 6.29l.38-.38a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                    Gọi điện
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => openModal("modal-new-task")}>
                    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Đặt lịch hẹn
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => openModal("modal-new-opportunity")}>
                    <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tạo cơ hội
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products + Signals */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="card">
              <div className="card__header"><span className="card__title">Sản phẩm đang dùng</span></div>
              <div className="card__body" style={{ paddingTop: 10 }}>
                <div className="c360-products" style={{ padding: 0 }}>
                  {kh.products.map((p) => (
                    <div key={p.label} className="c360-product">
                      <div className="c360-pname">{p.label}</div>
                      <div className="c360-pval" style={{ color: p.color || "var(--text-primary)" }}>{p.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card__header"><span className="card__title">Cảnh báo & Cơ hội</span></div>
              <div className="card__body" style={{ paddingTop: 10, paddingBottom: 10 }}>
                {kh.signals.map((s) => (
                  <div key={s.title} className={`signal-item signal-item--${s.type}`} onClick={() => openModal("modal-new-task")}>
                    {s.type === "upsell" && <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
                    {s.type === "renew" && <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>}
                    {s.type === "alert" && <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
                    <div className="signal-text"><strong>{s.title}:</strong> {s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity timeline */}
          <div className="card">
            <div className="card__header">
              <span className="card__title">Lịch sử tương tác</span>
              <span className="card__action" onClick={() => showToast("Xem toàn bộ lịch sử", "info")}>Tất cả →</span>
            </div>
            <div className="card__body" style={{ paddingTop: 8, paddingBottom: 4 }}>
              <div className="activity-list">
                {[
                  { dot: "deal", text: `Chốt hợp đồng thành công – ${kh.products[0].value}`, time: "20/03 15:30" },
                  { dot: "call", text: "RM gọi điện xác nhận thông tin KYC", time: "18/03 10:00" },
                  { dot: "meet", text: "Tư vấn trực tiếp tại Chi nhánh Cầu Giấy", time: "15/03 14:00" },
                  { dot: "syst", text: "Tạo hồ sơ KH trên hệ thống CRM", time: "10/03 09:00" },
                ].map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className={`dot dot--${a.dot}`} />
                    <div className="text">{a.text}</div>
                    <div className="time">{a.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASKS PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function Tasks() {
  const { openModal } = useApp();
  const [tasks, setTasks] = useState(MOCK_TASKS.map((t) => ({ ...t })));

  const toggle = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const today = tasks.filter((t) => t.day === "today");
  const tomorrow = tasks.filter((t) => t.day === "tomorrow");

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Tasks & Lịch hẹn</div>
          <div className="page-subtitle">Hôm nay, 20/03/2025 · {today.filter((t) => !t.done).length} tasks chưa xong</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => openModal("modal-new-task")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo Task
          </button>
        </div>
      </div>

      <div className="two-col">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Today tasks */}
          <div className="card">
            <div className="card__header">
              <span className="card__title">Hôm nay</span>
              <span style={{ fontSize: 11, background: "var(--danger-soft)", color: "var(--danger)", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                {today.filter((t) => t.priority === "high" && !t.done).length} khẩn cấp
              </span>
            </div>
            <div className="card__body" style={{ paddingTop: 8, paddingBottom: 8 }}>
              {today.map((task) => (
                <div key={task.id} className="task-item" onClick={() => toggle(task.id)}>
                  <div className={`task-item__cb${task.done ? " task-item__cb--done" : ""}`} />
                  <div className="task-item__content">
                    <div className={`task-item__name${task.done ? " task-item__name--done" : ""}`}>{task.name}</div>
                    <div className="task-item__meta">{task.meta}</div>
                  </div>
                  <div className={`task-item__pri task-item__pri--${task.priority}`}>
                    {task.priority === "high" ? "Cao" : task.priority === "med" ? "TB" : "Thấp"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tomorrow tasks */}
          <div className="card">
            <div className="card__header"><span className="card__title">Ngày mai, 21/03</span></div>
            <div className="card__body" style={{ paddingTop: 8, paddingBottom: 8 }}>
              {tomorrow.map((task) => (
                <div key={task.id} className="task-item" onClick={() => toggle(task.id)}>
                  <div className={`task-item__cb${task.done ? " task-item__cb--done" : ""}`} />
                  <div className="task-item__content">
                    <div className={`task-item__name${task.done ? " task-item__name--done" : ""}`}>{task.name}</div>
                    <div className="task-item__meta">{task.meta}</div>
                  </div>
                  <div className={`task-item__pri task-item__pri--${task.priority}`}>
                    {task.priority === "high" ? "Cao" : task.priority === "med" ? "TB" : "Thấp"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar + Reminders */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Mini calendar */}
          <div className="card">
            <div className="card__header"><span className="card__title">Tháng 3/2025</span></div>
            <div className="card__body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center", marginBottom: 8 }}>
                {["T2","T3","T4","T5","T6","T7","CN"].map((d) => (
                  <div key={d} style={{ fontSize: 10, color: "var(--text-muted)", padding: 4 }}>{d}</div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
                {[null,null,null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map((d, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 12,
                      padding: 5,
                      borderRadius: 6,
                      background: d === 20 ? "var(--accent)" : "transparent",
                      color: d === 20 ? "white" : d === null ? "transparent" : "var(--text-secondary)",
                      fontWeight: d === 20 ? 600 : 400,
                      position: "relative",
                      cursor: d ? "pointer" : "default",
                    }}
                  >
                    {d}
                    {[7, 14, 21].includes(d as number) && d !== 20 && (
                      <span style={{ position: "absolute", top: 1, right: 2, width: 5, height: 5, borderRadius: "50%", background: d === 7 ? "var(--accent)" : d === 14 ? "var(--warning)" : "var(--gold)" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System reminders */}
          <div className="card">
            <div className="card__header"><span className="card__title">Nhắc nhở hệ thống</span></div>
            <div className="card__body" style={{ paddingTop: 8, paddingBottom: 8 }}>
              <div className="activity-list">
                {[
                  { dot: "alert", text: <><strong>KH Lê Hải Nam</strong> – Thẻ TD đáo hạn thanh toán 22/03</>, time: "2 ngày" },
                  { dot: "call", text: <><strong>KH Hoàng Thị Lan</strong> – Tiết kiệm đến hạn 25/03</>, time: "5 ngày" },
                  { dot: "meet", text: <><strong>Trương Bảo Châu</strong> – Bảo hiểm tái tục 25/04</>, time: "36 ngày" },
                ].map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className={`dot dot--${a.dot}`} />
                    <div className="text">{a.text}</div>
                    <div className="time">{a.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APPROVAL PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function Approval() {
  const { openModal } = useApp();
  const [approvals, setApprovals] = useState(MOCK_APPROVALS.map((a) => ({ ...a })));
  const [filter, setFilter] = useState("all");

  const approve = (id: string) => setApprovals((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" } : a));
  const reject = (id: string) => setApprovals((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected" } : a));

  const filtered = approvals.filter((a) => {
    if (filter === "all") return true;
    if (filter === "pending") return a.status === "pending";
    if (filter === "reviewing") return a.status === "reviewing";
    if (filter === "approved") return a.status === "approved";
    if (filter === "rejected") return a.status === "rejected";
    return true;
  });

  const counts = {
    pending: approvals.filter((a) => a.status === "pending").length,
    reviewing: approvals.filter((a) => a.status === "reviewing").length,
    approved: approvals.filter((a) => a.status === "approved").length,
    rejected: approvals.filter((a) => a.status === "rejected").length,
  };

  const statusIconType = (s: string) => s === "pending" ? "pending" : s === "reviewing" ? "review" : s === "approved" ? "approved" : "rejected";

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Phê duyệt Hồ sơ</div>
          <div className="page-subtitle">Luồng duyệt đề xuất nội bộ – RM → Credit → Ban lãnh đạo</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => openModal("modal-approval-filter")}>
            <svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Lọc
          </button>
          <button className="btn btn--primary" onClick={() => openModal("modal-new-approval")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo đề xuất
          </button>
        </div>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { label: "Chờ phê duyệt", value: counts.pending, color: "gold", icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
          { label: "Đang xem xét", value: counts.reviewing, color: "blue", icon: <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
          { label: "Đã phê duyệt", value: counts.approved, color: "green", icon: <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
          { label: "Bị từ chối", value: counts.rejected, color: "red", icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
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

      <div className="filter-row">
        {[
          { key: "all", label: `Tất cả (${approvals.length})` },
          { key: "pending", label: `Chờ duyệt (${counts.pending})` },
          { key: "reviewing", label: `Đang xét (${counts.reviewing})` },
          { key: "approved", label: `Đã duyệt (${counts.approved})` },
          { key: "rejected", label: `Từ chối (${counts.rejected})` },
        ].map((f) => (
          <div key={f.key} className={`filter-chip${filter === f.key ? " filter-chip--active" : ""}`} onClick={() => setFilter(f.key)}>{f.label}</div>
        ))}
      </div>

      <div className="card">
        <div className="card__body" style={{ padding: 0 }}>
          {filtered.map((apv) => (
            <div key={apv.id} className="approval-item" style={{ padding: "10px 18px" }} onClick={() => openModal("modal-approval-detail")}>
              <div className={`approval-item__icon approval-item__icon--${statusIconType(apv.status)}`}>
                {apv.status === "pending" && <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                {apv.status === "reviewing" && <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                {apv.status === "approved" && <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                {apv.status === "rejected" && <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="approval-item__title">#{apv.id} · {apv.customer} – {apv.type}</div>
                <div className="approval-item__meta">{apv.value} · RM: {apv.rm} · Hạn: {apv.deadline}</div>
              </div>
              {(apv.status === "pending" || apv.status === "reviewing") && (
                <div className="approval-item__actions" onClick={(e) => e.stopPropagation()}>
                  <button className="apv-btn apv-btn--ok" onClick={() => approve(apv.id)}>Duyệt</button>
                  <button className="apv-btn apv-btn--reject" onClick={() => reject(apv.id)}>Từ chối</button>
                </div>
              )}
              {apv.status === "approved" && (
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--success-soft)", color: "var(--success)", fontWeight: 600, flexShrink: 0 }}>✓ Đã duyệt</span>
              )}
              {apv.status === "rejected" && (
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--danger-soft)", color: "var(--danger)", fontWeight: 600, flexShrink: 0 }}>✗ Từ chối</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI REPORT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function KpiReport() {
  const { showToast } = useApp();

  const kpiItems = [
    { label: "Doanh số tín dụng (Vay)", actual: "18.4 tỷ", target: "23.5 tỷ", pct: 78, color: "var(--success)" },
    { label: "Số thẻ tín dụng mở mới", actual: "62 thẻ", target: "100 thẻ", pct: 62, color: "var(--accent)" },
    { label: "Huy động tiết kiệm", actual: "27.3 tỷ", target: "30 tỷ", pct: 91, color: "var(--gold)" },
    { label: "Phí Bancassurance", actual: "4.5 tỷ", target: "10 tỷ", pct: 45, color: "var(--purple)" },
    { label: "Số leads mới", actual: "247", target: "200", pct: 100, color: "var(--success)" },
    { label: "Tỷ lệ chuyển đổi Lead→Deal", actual: "34.2%", target: "30%", pct: 100, color: "var(--success)" },
    { label: "NPS trung bình", actual: "8.7", target: "8.0", pct: 100, color: "var(--success)" },
    { label: "Thời gian xử lý hồ sơ TB", actual: "4.2 ngày", target: "5 ngày", pct: 100, color: "var(--success)" },
  ];

  const leaderboard = [
    { rank: 1, initials: "HT", name: "Nguyễn Hà Thu", branch: "HN – Quận 1", val: "4.2 tỷ", barW: "100%", color: "linear-gradient(135deg,#F5A623,#F57C00)", barColor: "var(--gold)" },
    { rank: 2, initials: "TN", name: "Trần Nguyên", branch: "HN – Quận 2", val: "3.8 tỷ", barW: "90%", color: "linear-gradient(135deg,#1565C0,var(--accent))", barColor: "var(--success)" },
    { rank: 3, initials: "NA", name: "Vũ Ngọc Anh", branch: "HN – Quận 4", val: "3.1 tỷ", barW: "74%", color: "linear-gradient(135deg,#7B1FA2,#9C27B0)", barColor: "var(--success)" },
    { rank: 4, initials: "MQ", name: "Lê Minh Quân", branch: "HN – Quận 1", val: "2.7 tỷ", barW: "64%", color: "linear-gradient(135deg,#388E3C,#4CAF50)", barColor: "var(--success)" },
    { rank: 5, initials: "VĐ", name: "Hoàng Văn Đức", branch: "HN – Quận 3", val: "2.3 tỷ", barW: "55%", color: "linear-gradient(135deg,#0097A7,#00BCD4)", barColor: "var(--success)" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Báo cáo KPI</div>
          <div className="page-subtitle">Tháng 3/2025 · Chi nhánh Hà Nội</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => showToast("Đang xuất báo cáo PDF...", "info")}>
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="metric-grid">
        {[
          { label: "Tổng doanh số", val: "18.4 tỷ", trend: "↑ 23%", tColor: "var(--success)", color: "blue", icon: <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
          { label: "Deals đã chốt", val: "12", trend: "↑ 4 so với T2", tColor: "var(--success)", color: "gold", icon: <svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg> },
          { label: "NPS trung bình", val: "8.7", trend: "↑ 0.3 pts", tColor: "var(--success)", color: "green", icon: <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
          { label: "Hồ sơ từ chối", val: "1", trend: "↓ 2 so với T2", tColor: "var(--success)", color: "red", icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/></svg> },
        ].map((m) => (
          <div key={m.label} className={`metric-card metric-card--${m.color}`}>
            <div className="metric-card__top">
              <div className={`metric-card__icon metric-card__icon--${m.color}`}>{m.icon}</div>
              <span className="metric-card__trend metric-card__trend--up" style={{ color: m.tColor }}>{m.trend}</span>
            </div>
            <div className="metric-card__value">{m.val}</div>
            <div className="metric-card__label">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* KPI progress */}
        <div className="card">
          <div className="card__header"><span className="card__title">KPI Chi tiết – Tháng 3/2025</span></div>
          <div className="card__body">
            {kpiItems.map((k) => (
              <div key={k.label} className="progress-item">
                <div className="progress-label-row">
                  <span className="progress-label">{k.label}</span>
                  <span className="pct" style={{ color: k.color }}>{k.pct >= 100 ? "✓ " : ""}{k.actual} / {k.target}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${Math.min(k.pct, 100)}%`, background: k.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">Leaderboard RM</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Tháng 3/2025</span>
          </div>
          <div className="card__body" style={{ paddingTop: 8, paddingBottom: 8 }}>
            {leaderboard.map((lb) => (
              <div key={lb.rank} className="lb-item">
                <div className={`rank${lb.rank <= 3 ? " rank--top" : ""}`}>{lb.rank}</div>
                <div className="avatar" style={{ background: lb.color }}>{lb.initials}</div>
                <div className="info">
                  <div className="name">{lb.name}</div>
                  <div className="branch">{lb.branch}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="val">{lb.val}</div>
                  <div className="bar-wrap"><div className="bar" style={{ width: lb.barW, background: lb.barColor }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="three-col">
        <div className="card">
          <div className="card__header"><span className="card__title">Doanh số 6 tháng</span></div>
          <div className="card__body">
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              {[["var(--accent)", "Thực tế"], ["rgba(33,150,243,0.25)", "Mục tiêu"]].map(([c, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-secondary)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
                </div>
              ))}
            </div>
            <div className="chart-area">
              {[[70,80],[55,75],[80,78],[65,82],[90,85],[75,90]].map(([a,b],i) => (
                <div key={i} className="bar-group">
                  <div className="cb cb--a" style={{ height: `${a}%` }} />
                  <div className="cb cb--b" style={{ height: `${b}%` }} />
                </div>
              ))}
            </div>
            <div className="chart-x"><span>T10</span><span>T11</span><span>T12</span><span>T1</span><span>T2</span><span>T3</span></div>
          </div>
        </div>

        {/* Product mix */}
        <div className="card">
          <div className="card__header"><span className="card__title">Cơ cấu sản phẩm</span></div>
          <div className="card__body">
            <div className="donut-wrap">
              <svg width="100" height="100" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--accent)" strokeWidth="3.8" strokeDasharray="44 56" strokeDashoffset="25"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--gold)" strokeWidth="3.8" strokeDasharray="22 78" strokeDashoffset="-19"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--success)" strokeWidth="3.8" strokeDasharray="20 80" strokeDashoffset="-41"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--purple)" strokeWidth="3.8" strokeDasharray="14 86" strokeDashoffset="-61"/>
              </svg>
              <div className="donut-legend">
                {[
                  { c: "var(--accent)", l: "Vay tài sản/DN", p: "44%", pc: "var(--accent-bright)" },
                  { c: "var(--gold)", l: "Thẻ tín dụng", p: "22%", pc: "var(--gold)" },
                  { c: "var(--success)", l: "Tiết kiệm/TG", p: "20%", pc: "var(--success)" },
                  { c: "var(--purple)", l: "Bancassurance", p: "14%", pc: "var(--purple)" },
                ].map((d) => (
                  <div key={d.l} className="dl-item">
                    <div className="dl-dot" style={{ background: d.c }} />
                    <span className="dl-label">{d.l}</span>
                    <span className="dl-pct" style={{ color: d.pc }}>{d.p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity chart */}
        <div className="card">
          <div className="card__header"><span className="card__title">Hoạt động theo ngày</span></div>
          <div className="card__body">
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              {[["var(--accent)", "Calls"], ["var(--gold)", "Meetings"], ["var(--success)", "Deals"]].map(([c, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-secondary)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
                </div>
              ))}
            </div>
            <div className="chart-area">
              {[[60,40,30],[80,50,20],[55,45,40],[75,60,50],[90,70,60],[65,55,45]].map((bars, i) => (
                <div key={i} className="bar-group">
                  {bars.map((h, j) => (
                    <div key={j} className="cb" style={{ height: `${h}%`, background: j === 0 ? "var(--accent)" : j === 1 ? "var(--gold)" : "var(--success)" }} />
                  ))}
                </div>
              ))}
            </div>
            <div className="chart-x"><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NPS PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function NPS() {
  const { openModal } = useApp();

  const npsData = [
    { initials: "TC", name: "Trương Bảo Châu", type: "VIP Platinum", rm: "Hà Thu", score: 10, scoreType: "promoter", comment: "RM rất nhiệt tình, tư vấn chuyên nghiệp. Thủ tục nhanh gọn." },
    { initials: "HH", name: "Hoàng Thị Hoa", type: "Cá nhân", rm: "Trần Nguyên", score: 9, scoreType: "promoter", comment: "Rất hài lòng với sản phẩm vay mua nhà, lãi suất tốt." },
    { initials: "PD", name: "Phạm Xuân Đức", type: "Cá nhân", rm: "Ngọc Anh", score: 8, scoreType: "promoter", comment: "Dịch vụ tốt, sẽ giới thiệu cho bạn bè." },
    { initials: "LN", name: "Lê Hải Nam", type: "Cá nhân", rm: "Hà Thu", score: 6, scoreType: "passive", comment: "Thủ tục còn hơi nhiều giấy tờ." },
    { initials: "TT", name: "Tran Van Tuong", type: "Cá nhân", rm: "Minh Quân", score: 4, scoreType: "detractor", comment: "Thời gian xử lý hồ sơ quá chậm, cần cải thiện." },
  ];

  const promoters  = npsData.filter((n) => n.scoreType === "promoter").length;
  const passives   = npsData.filter((n) => n.scoreType === "passive").length;
  const detractors = npsData.filter((n) => n.scoreType === "detractor").length;
  const npsScore   = Math.round(((promoters - detractors) / npsData.length) * 100);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">NPS & Chăm sóc KH</div>
          <div className="page-subtitle">Net Promoter Score – Tháng 3/2025</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => openModal("modal-send-survey")}>
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Gửi khảo sát NPS
          </button>
        </div>
      </div>

      {/* NPS Summary */}
      <div className="metric-grid">
        <div className="metric-card metric-card--green">
          <div className="metric-card__top">
            <div className="metric-card__icon metric-card__icon--green"><svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg></div>
            <span className="metric-card__trend metric-card__trend--up">↑ 0.5 pts</span>
          </div>
          <div className="metric-card__value" style={{ color: "var(--success)" }}>{npsScore}</div>
          <div className="metric-card__label">NPS Score tháng này</div>
        </div>
        <div className="metric-card metric-card--blue">
          <div className="metric-card__top"><div className="metric-card__icon metric-card__icon--blue"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div></div>
          <div className="metric-card__value">{npsData.length}</div>
          <div className="metric-card__label">Phản hồi tháng này</div>
        </div>
        <div className="metric-card metric-card--gold">
          <div className="metric-card__top"><div className="metric-card__icon metric-card__icon--gold"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div></div>
          <div className="metric-card__value">{promoters}</div>
          <div className="metric-card__label">Promoters ({Math.round((promoters/npsData.length)*100)}%)</div>
        </div>
        <div className="metric-card metric-card--red">
          <div className="metric-card__top"><div className="metric-card__icon metric-card__icon--red"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/></svg></div></div>
          <div className="metric-card__value">{detractors}</div>
          <div className="metric-card__label">Detractors ({Math.round((detractors/npsData.length)*100)}%)</div>
        </div>
      </div>

      <div className="two-col">
        {/* NPS responses */}
        <div className="card">
          <div className="card__header"><span className="card__title">Phản hồi gần đây</span></div>
          <div className="card__body" style={{ padding: 0 }}>
            {npsData.map((n, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                onClick={() => openModal("modal-nps-detail")}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#1565C0,var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>{n.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{n.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.comment}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: n.scoreType === "promoter" ? "var(--success)" : n.scoreType === "passive" ? "var(--warning)" : "var(--danger)" }}>{n.score}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{n.type === "promoter" ? "Promoter" : n.type === "passive" ? "Passive" : "Detractor"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NPS by RM + trend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card__header"><span className="card__title">NPS theo RM</span></div>
            <div className="card__body">
              {[
                { name: "Nguyễn Hà Thu", score: 9.2, pct: 92 },
                { name: "Trần Nguyên", score: 8.7, pct: 87 },
                { name: "Vũ Ngọc Anh", score: 8.5, pct: 85 },
                { name: "Lê Minh Quân", score: 8.1, pct: 81 },
                { name: "Hoàng Văn Đức", score: 7.8, pct: 78 },
              ].map((rm) => (
                <div key={rm.name} className="progress-item">
                  <div className="progress-label-row">
                    <span className="progress-label">{rm.name}</span>
                    <span className="pct" style={{ color: "var(--success)" }}>{rm.score}/10</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar__fill" style={{ width: `${rm.pct}%`, background: "var(--success)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card__header"><span className="card__title">Chỉ số chi tiết</span></div>
            <div className="card__body">
              {[
                { label: "Tốc độ xử lý TB", val: "4.1/5", color: "var(--success)" },
                { label: "Chất lượng sản phẩm TB", val: "4.3/5", color: "var(--success)" },
                { label: "Thái độ RM TB", val: "4.5/5", color: "var(--success)" },
                { label: "Tỷ lệ phản hồi", val: "45%", color: "var(--gold)" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
                  <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
