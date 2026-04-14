import React, { useState, useMemo } from "react";
import {
  MOCK_COMPLAINT_TICKETS, MOCK_PROJECTS, MOCK_CUSTOMERS,
} from "assets/mock/TNPMData";

const CATEGORY_META: Record<string, { label: string; color: string; icon: string }> = {
  noise: { label: "Tiếng ồn", color: "#fa8c16", icon: "🔊" },
  security: { label: "An ninh", color: "#ff4d4f", icon: "🛡️" },
  cleanliness: { label: "Vệ sinh", color: "#13c2c2", icon: "🧹" },
  staff: { label: "Thái độ NV", color: "#722ed1", icon: "👤" },
  billing: { label: "Hóa đơn", color: "#faad14", icon: "💳" },
  neighbor: { label: "Hàng xóm", color: "#eb2f96", icon: "🏘️" },
  other: { label: "Khác", color: "#8c8c8c", icon: "📋" },
};

const SEVERITY_META: Record<string, { label: string; color: string }> = {
  low: { label: "Thấp", color: "#52c41a" },
  medium: { label: "Trung bình", color: "#faad14" },
  high: { label: "Cao", color: "#fa8c16" },
  critical: { label: "Nghiêm trọng", color: "#ff4d4f" },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "#faad14" },
  in_progress: { label: "Đang xử lý", color: "#1890ff" },
  resolved: { label: "Đã xử lý", color: "#52c41a" },
  closed: { label: "Đã đóng", color: "#8c8c8c" },
  rejected: { label: "Từ chối", color: "#ff4d4f" },
};

// ─── Add/Edit Ticket Modal ───────────────────────────────────────────────
function TicketModal({ ticket, onClose, onSave }: any) {
  const isEdit = !!ticket?.id;
  const [form, setForm] = useState<any>({
    projectId: "", customerId: "", unitCode: "",
    category: "noise", severity: "medium",
    title: "", description: "",
    status: "pending", assignedDept: "Ban quản lý", assignedTo: "",
    ...ticket,
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title) return alert("Vui lòng nhập tiêu đề");
    if (!form.customerId) return alert("Vui lòng chọn cư dân/tenant");
    const customer = MOCK_CUSTOMERS.find((c: any) => c.id === +form.customerId);
    const project = MOCK_PROJECTS.find((p: any) => p.id === +form.projectId);
    const catMeta = CATEGORY_META[form.category];
    const sevMeta = SEVERITY_META[form.severity];

    onSave({
      ...form,
      id: form.id || Date.now(),
      code: form.code || `KN-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      projectId: +form.projectId,
      projectName: project?.name || form.projectName,
      customerId: +form.customerId,
      customerName: customer?.name || form.customerName,
      categoryLabel: catMeta.label,
      severityLabel: sevMeta.label,
      statusLabel: STATUS_META[form.status]?.label || form.status,
      createdAt: form.createdAt || new Date().toISOString().replace("T", " ").slice(0, 16),
      dueAt: form.dueAt || new Date(Date.now() + 3 * 86400000).toISOString().replace("T", " ").slice(0, 16),
      priority: form.severity === "critical" ? 4 : form.severity === "high" ? 3 : form.severity === "medium" ? 2 : 1,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Sửa phiếu khiếu nại" : "📝 Tạo phiếu khiếu nại mới"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Dự án *</label>
              <select className="form-control" value={form.projectId} onChange={(e) => set("projectId", e.target.value)}>
                <option value="">-- Chọn dự án --</option>
                {MOCK_PROJECTS.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Cư dân/Tenant *</label>
              <select className="form-control" value={form.customerId} onChange={(e) => set("customerId", e.target.value)}>
                <option value="">-- Chọn KH --</option>
                {MOCK_CUSTOMERS.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Unit/Căn</label>
              <input className="form-control" value={form.unitCode} onChange={(e) => set("unitCode", e.target.value)} placeholder="VD: A-1201" />
            </div>
            <div className="form-group">
              <label>Danh mục khiếu nại *</label>
              <select className="form-control" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {Object.entries(CATEGORY_META).map(([v, m]) => <option key={v} value={v}>{m.icon} {m.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Mức độ nghiêm trọng</label>
              <select className="form-control" value={form.severity} onChange={(e) => set("severity", e.target.value)}>
                {Object.entries(SEVERITY_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Phòng ban xử lý</label>
              <select className="form-control" value={form.assignedDept} onChange={(e) => set("assignedDept", e.target.value)}>
                <option value="Ban quản lý">Ban quản lý</option>
                <option value="An ninh">An ninh</option>
                <option value="Vệ sinh">Vệ sinh</option>
                <option value="Kỹ thuật">Kỹ thuật</option>
                <option value="Kế toán">Kế toán</option>
                <option value="HR">HR</option>
                <option value="Ban lãnh đạo TNPM">Ban lãnh đạo TNPM</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Tiêu đề *</label>
              <input className="form-control" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Mô tả chi tiết</label>
              <textarea className="form-control" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave}>💾 Lưu phiếu</button>
        </div>
      </div>
    </div>
  );
}

// ─── Resolve Modal ───────────────────────────────────────────────────────
function ResolveModal({ ticket, onClose, onResolve }: any) {
  const [resolution, setResolution] = useState(ticket.resolution || "");
  const [rating, setRating] = useState<number | null>(null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2 className="modal-title">✅ Xử lý phiếu {ticket.code}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ padding: 12, background: "#f5f7fa", borderRadius: 6, marginBottom: 14 }}>
            <div style={{ fontWeight: 600 }}>{ticket.title}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 2 }}>
              {ticket.customerName} · {ticket.unitCode}
            </div>
          </div>
          <div className="form-group">
            <label>Biện pháp xử lý *</label>
            <textarea className="form-control" rows={4} value={resolution} onChange={(e) => setResolution(e.target.value)}
              placeholder="Mô tả chi tiết cách xử lý, nhân viên tham gia, kết quả..." />
          </div>
          <div className="form-group">
            <label>Đánh giá từ khách (0-5 sao, tùy chọn)</label>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button"
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: 24, border: "none", background: "transparent", cursor: "pointer",
                    color: (rating || 0) >= star ? "#faad14" : "#d9d9d9",
                  }}>
                  ★
                </button>
              ))}
              {rating !== null && <button type="button" onClick={() => setRating(null)} style={{ marginLeft: 8, fontSize: 11 }}>Xóa</button>}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => {
            if (!resolution.trim()) return alert("Vui lòng nhập biện pháp xử lý");
            onResolve({ resolution, rating });
          }}>✓ Xác nhận đã xử lý</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function ComplaintTicketList() {
  document.title = "Phiếu khiếu nại cư dân – TNPM";

  const [tickets, setTickets] = useState<any[]>(MOCK_COMPLAINT_TICKETS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [resolveTarget, setResolveTarget] = useState<any>(null);

  const filtered = useMemo(() => {
    return tickets.filter((t: any) => {
      const q = search.toLowerCase();
      if (search && !t.title.toLowerCase().includes(q) && !t.code.toLowerCase().includes(q) && !t.customerName.toLowerCase().includes(q)) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterCategory && t.category !== filterCategory) return false;
      if (filterSeverity && t.severity !== filterSeverity) return false;
      if (filterProject && String(t.projectId) !== filterProject) return false;
      return true;
    });
  }, [tickets, search, filterStatus, filterCategory, filterSeverity, filterProject]);

  const kpi = {
    total: tickets.length,
    pending: tickets.filter((t: any) => t.status === "pending").length,
    inProgress: tickets.filter((t: any) => t.status === "in_progress").length,
    resolved: tickets.filter((t: any) => t.status === "resolved").length,
    critical: tickets.filter((t: any) => t.severity === "critical" && t.status !== "resolved" && t.status !== "closed").length,
    avgRating: (() => {
      const rated = tickets.filter((t: any) => t.feedbackRating !== null);
      if (rated.length === 0) return 0;
      return rated.reduce((a: number, t: any) => a + t.feedbackRating, 0) / rated.length;
    })(),
  };

  const handleSave = (data: any) => {
    if (tickets.find((t: any) => t.id === data.id)) {
      setTickets((prev: any) => prev.map((t: any) => (t.id === data.id ? data : t)));
    } else {
      setTickets((prev: any) => [data, ...prev]);
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const handleResolve = (data: any) => {
    setTickets((prev: any) => prev.map((t: any) =>
      t.id === resolveTarget.id
        ? {
            ...t,
            status: "resolved",
            statusLabel: "Đã xử lý",
            resolution: data.resolution,
            resolvedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
            feedbackRating: data.rating,
          }
        : t
    ));
    setResolveTarget(null);
  };

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📝 Phiếu khiếu nại cư dân</h1>
          <p className="page-sub">Tiếp nhận, phân loại và xử lý phản ánh/khiếu nại từ cư dân, tenant — tách biệt với SR kỹ thuật</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline">📊 Xuất báo cáo</button>
          <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>+ Tạo phiếu</button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Tổng phiếu", value: `${kpi.total}`, color: "#1890ff", icon: "📋" },
          { label: "Chờ xử lý", value: `${kpi.pending}`, color: "#faad14", icon: "⏳" },
          { label: "Đang xử lý", value: `${kpi.inProgress}`, color: "#722ed1", icon: "⚙️" },
          { label: "Đã xử lý", value: `${kpi.resolved}`, color: "#52c41a", icon: "✅" },
          { label: "Nghiêm trọng đang mở", value: `${kpi.critical}`, color: "#ff4d4f", icon: "🚨" },
          { label: "Rating TB", value: kpi.avgRating > 0 ? `${kpi.avgRating.toFixed(1)} ⭐` : "—", color: "#fa8c16", icon: "⭐" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "14px 14px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 16 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#1a1a2e", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #f0f0f0", background: "#fff", borderRadius: "12px 12px 0 0", padding: "0 16px" }}>
        {[
          { key: "all", label: `Tất cả (${tickets.length})` },
          { key: "pending", label: `⏳ Chờ xử lý (${kpi.pending})` },
          { key: "in_progress", label: `⚙️ Đang xử lý (${kpi.inProgress})` },
          { key: "resolved", label: `✅ Đã xử lý (${kpi.resolved})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilterStatus(t.key)}
            style={{
              padding: "12px 20px", border: "none", background: "transparent", cursor: "pointer",
              fontSize: 13, fontWeight: filterStatus === t.key ? 600 : 400,
              color: filterStatus === t.key ? "#1890ff" : "#8c8c8c",
              borderBottom: filterStatus === t.key ? "2px solid #1890ff" : "2px solid transparent",
            }}
          >{t.label}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", padding: "8px 0" }}>
          <input className="search-input" style={{ width: 220 }} placeholder="🔍 Tìm mã, tiêu đề, KH..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">Tất cả danh mục</option>
            {Object.entries(CATEGORY_META).map(([v, m]) => <option key={v} value={v}>{m.icon} {m.label}</option>)}
          </select>
          <select className="filter-select" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="">Mọi mức độ</option>
            {Object.entries(SEVERITY_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
          </select>
          <select className="filter-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
            <option value="">Tất cả dự án</option>
            {MOCK_PROJECTS.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tiêu đề / KH</th>
              <th>Danh mục</th>
              <th>Mức độ</th>
              <th>Dự án / Unit</th>
              <th>Phân công</th>
              <th>Ngày tạo</th>
              <th>Hạn xử lý</th>
              <th>Trạng thái</th>
              <th>Đánh giá</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={11} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có phiếu khiếu nại nào phù hợp.</td></tr>
            )}
            {filtered.map((t: any) => {
              const catMeta = CATEGORY_META[t.category];
              const sevMeta = SEVERITY_META[t.severity];
              const statusMeta = STATUS_META[t.status];
              return (
                <tr key={t.id}>
                  <td><span className="code-text">{t.code}</span></td>
                  <td style={{ maxWidth: 260 }}>
                    <div style={{ fontWeight: 500, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: "#8c8c8c" }}>{t.customerName}</div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: `${catMeta?.color}22`, color: catMeta?.color }}>
                      {catMeta?.icon} {catMeta?.label}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: `${sevMeta?.color}22`, color: sevMeta?.color }}>
                      {sevMeta?.label}
                    </span>
                  </td>
                  <td style={{ fontSize: 11 }}>
                    <div>{t.projectName}</div>
                    <div style={{ color: "#8c8c8c" }}>{t.unitCode}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    <div>{t.assignedDept}</div>
                    <div style={{ fontSize: 10, color: "#8c8c8c" }}>{t.assignedTo || "Chưa gán"}</div>
                  </td>
                  <td style={{ fontSize: 11 }}>{t.createdAt}</td>
                  <td style={{ fontSize: 11, color: t.status === "pending" || t.status === "in_progress" ? "#ff4d4f" : "#8c8c8c" }}>{t.dueAt}</td>
                  <td>
                    <span className="status-badge" style={{ background: `${statusMeta?.color}22`, color: statusMeta?.color }}>
                      {statusMeta?.label}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {t.feedbackRating ? (
                      <span style={{ color: "#faad14", fontWeight: 600 }}>{t.feedbackRating} ⭐</span>
                    ) : <span style={{ color: "#8c8c8c" }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 5 }}>
                      {t.status !== "resolved" && t.status !== "closed" && (
                        <button className="action-btn" title="Xử lý" onClick={() => setResolveTarget(t)} style={{ background: "#f6ffed" }}>✅</button>
                      )}
                      <button className="action-btn" title="Sửa" onClick={() => { setEditTarget(t); setShowModal(true); }}>✏️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && <TicketModal ticket={editTarget} onClose={() => { setShowModal(false); setEditTarget(null); }} onSave={handleSave} />}
      {resolveTarget && <ResolveModal ticket={resolveTarget} onClose={() => setResolveTarget(null)} onResolve={handleResolve} />}
    </div>
  );
}
