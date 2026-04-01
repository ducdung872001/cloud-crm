import React, { useState, useMemo } from "react";
import {
  MOCK_SERVICE_REQUESTS, MOCK_PROJECTS, MOCK_VENDORS,
  SERVICE_REQUEST_CATEGORIES, STATUS_LABELS, STATUS_COLORS,
} from "assets/mock/TNPMData";

function AddSRModal({ sr, onSave, onClose }: any) {
  const isEdit = !!sr?.id;
  const [form, setForm] = useState({
    code: "", projectId: "", customerId: "", customerName: "", unitCode: "",
    category: "maintenance", priority: "medium", title: "", description: "",
    status: "pending", assignedVendorId: "", assignedEmployeeName: "",
    ...sr,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Cập nhật yêu cầu" : "🔧 Tạo yêu cầu dịch vụ"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Mã yêu cầu</label>
              <input className="form-control" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="SR-2024-001" />
            </div>
            <div className="form-group">
              <label>Dự án <span className="required">*</span></label>
              <select className="form-control" value={form.projectId} onChange={(e) => set("projectId", +e.target.value)}>
                <option value="">-- Chọn dự án --</option>
                {MOCK_PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Khách hàng / Đơn vị yêu cầu</label>
              <input className="form-control" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="Tên khách hàng" />
            </div>
            <div className="form-group">
              <label>Mã Unit</label>
              <input className="form-control" value={form.unitCode} onChange={(e) => set("unitCode", e.target.value)} placeholder="A-1201" />
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <select className="form-control" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {SERVICE_REQUEST_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Mức độ ưu tiên</label>
              <select className="form-control" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                <option value="urgent">🔴 Khẩn cấp</option>
                <option value="high">🟠 Cao</option>
                <option value="medium">🔵 Trung bình</option>
                <option value="low">⚪ Thấp</option>
              </select>
            </div>
            <div className="form-group form-group--full">
              <label>Tiêu đề <span className="required">*</span></label>
              <input className="form-control" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Mô tả ngắn gọn vấn đề" required />
            </div>
            <div className="form-group form-group--full">
              <label>Mô tả chi tiết</label>
              <textarea className="form-control" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Mô tả chi tiết sự cố / yêu cầu..." />
            </div>
            <div className="form-group">
              <label>Phân công NCC</label>
              <select className="form-control" value={form.assignedVendorId} onChange={(e) => set("assignedVendorId", +e.target.value)}>
                <option value="">-- Chưa phân công --</option>
                {MOCK_VENDORS.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Nhân viên phụ trách</label>
              <input className="form-control" value={form.assignedEmployeeName} onChange={(e) => set("assignedEmployeeName", e.target.value)} placeholder="Tên nhân viên" />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="pending">Chờ xử lý</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="resolved">Đã xử lý</option>
                <option value="closed">Đã đóng</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...sr, ...form, createdAt: sr?.createdAt || new Date().toISOString() })}>
            {isEdit ? "Cập nhật" : "Tạo yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
}

const PRIORITY_CONFIG = {
  urgent: { label: "🔴 Khẩn cấp", color: "#ff4d4f" },
  high: { label: "🟠 Cao", color: "#fa8c16" },
  medium: { label: "🔵 Trung bình", color: "#1890ff" },
  low: { label: "⚪ Thấp", color: "#8c8c8c" },
};

export default function ServiceRequestList() {
  document.title = "Yêu cầu Dịch vụ – TNPM";

  const [requests, setRequests] = useState(MOCK_SERVICE_REQUESTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => requests.filter((r) => {
    const q = search.toLowerCase();
    return (
      (!search || r.code.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q)) &&
      (!filterStatus || r.status === filterStatus) &&
      (!filterPriority || r.priority === filterPriority) &&
      (!filterProject || String(r.projectId) === filterProject) &&
      (!filterCategory || r.category === filterCategory)
    );
  }), [requests, search, filterStatus, filterPriority, filterProject, filterCategory]);

  const handleSave = (data: any) => {
    if (data.id) setRequests((p) => p.map((r) => (r.id === data.id ? data : r)));
    else setRequests((p) => [...p, { ...data, id: Date.now() }]);
    setShowModal(false); setEditing(null);
  };

  const statusGroups = ["pending", "in_progress", "resolved", "closed"];
  const srByStatus = (status: string) => filtered.filter(r => r.status === status);

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🔧 Yêu cầu Dịch vụ</h1>
          <p className="page-sub">Service Request – Quản lý & theo dõi toàn bộ yêu cầu vận hành</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className={`btn ${viewMode === "table" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setViewMode("table")}
          >☰ Bảng</button>
          <button
            className={`btn ${viewMode === "kanban" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setViewMode("kanban")}
          >⬛ Kanban</button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Tạo yêu cầu</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Tổng SR", value: requests.length, color: "#1890ff" },
          { label: "Chờ xử lý", value: requests.filter(r => r.status === "pending").length, color: "#faad14" },
          { label: "Đang xử lý", value: requests.filter(r => r.status === "in_progress").length, color: "#1890ff" },
          { label: "Đã hoàn thành", value: requests.filter(r => r.status === "resolved").length, color: "#52c41a" },
          { label: "Khẩn cấp", value: requests.filter(r => r.priority === "urgent").length, color: "#ff4d4f" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input className="search-input" placeholder="🔍 Tìm SR, tiêu đề, khách hàng..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="in_progress">Đang xử lý</option>
          <option value="resolved">Đã xử lý</option>
          <option value="closed">Đã đóng</option>
        </select>
        <select className="filter-select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">Tất cả ưu tiên</option>
          <option value="urgent">🔴 Khẩn cấp</option>
          <option value="high">🟠 Cao</option>
          <option value="medium">🔵 Trung bình</option>
          <option value="low">⚪ Thấp</option>
        </select>
        <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          {SERVICE_REQUEST_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className="filter-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">Tất cả dự án</option>
          {MOCK_PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <span className="result-count">{filtered.length} yêu cầu</span>
      </div>

      {/* TABLE MODE */}
      {viewMode === "table" && (
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã SR</th>
                <th>Dự án</th>
                <th>Khách hàng</th>
                <th>Unit</th>
                <th>Danh mục</th>
                <th>Tiêu đề</th>
                <th>Ưu tiên</th>
                <th>NCC xử lý</th>
                <th>Tạo lúc</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={11} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có yêu cầu nào</td></tr>
              )}
              {filtered.map((r) => {
                const pri = PRIORITY_CONFIG[r.priority] || { label: r.priority, color: "#8c8c8c" };
                const cat = SERVICE_REQUEST_CATEGORIES.find(c => c.value === r.category);
                return (
                  <tr key={r.id}>
                    <td><span className="code-text">{r.code}</span></td>
                    <td style={{ fontSize: 12 }}>{r.projectName}</td>
                    <td style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.customerName}</td>
                    <td><span className="code-text">{r.unitCode}</span></td>
                    <td style={{ fontSize: 12 }}>{cat?.label || r.category}</td>
                    <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</td>
                    <td><span style={{ color: pri.color, fontWeight: 600, fontSize: 12 }}>{pri.label}</span></td>
                    <td style={{ fontSize: 12 }}>{r.assignedVendorName || "—"}</td>
                    <td style={{ fontSize: 11, color: "#8c8c8c" }}>{r.createdAt?.split(" ")[0]}</td>
                    <td>
                      <span className="status-badge" style={{ background: `${STATUS_COLORS[r.status]}22`, color: STATUS_COLORS[r.status] }}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button className="action-btn action-btn--edit" onClick={() => { setEditing(r); setShowModal(true); }}>✏️</button>
                        <button className="action-btn action-btn--delete" onClick={() => setDeleteId(r.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* KANBAN MODE */}
      {viewMode === "kanban" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {statusGroups.map((status) => (
            <div key={status} style={{ background: "#f5f6fa", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: STATUS_COLORS[status] }}>● {STATUS_LABELS[status]}</span>
                <span style={{ background: STATUS_COLORS[status], color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                  {srByStatus(status).length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {srByStatus(status).map((r) => {
                  const pri = PRIORITY_CONFIG[r.priority] || { label: r.priority, color: "#8c8c8c" };
                  return (
                    <div key={r.id}
                      style={{ background: "#fff", borderRadius: 10, padding: 14, boxShadow: "0 2px 6px rgba(0,0,0,.06)", borderLeft: `3px solid ${pri.color}`, cursor: "pointer" }}
                      onClick={() => { setEditing(r); setShowModal(true); }}
                    >
                      <div style={{ fontSize: 11, color: "#1890ff", fontFamily: "monospace", marginBottom: 4 }}>{r.code}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: "#8c8c8c" }}>📍 {r.projectName}</div>
                      <div style={{ fontSize: 11, color: "#8c8c8c" }}>👤 {r.customerName}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: pri.color }}>{pri.label}</span>
                        <span style={{ fontSize: 11, color: "#8c8c8c" }}>{r.createdAt?.split(" ")[0]}</span>
                      </div>
                    </div>
                  );
                })}
                {srByStatus(status).length === 0 && (
                  <div style={{ textAlign: "center", color: "#d9d9d9", padding: 20, fontSize: 13 }}>Trống</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <AddSRModal sr={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Xóa yêu cầu</h3>
            <p>Bạn có chắc muốn xóa yêu cầu dịch vụ này?</p>
            <div className="confirm-dialog__actions">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={() => { setRequests(p => p.filter(r => r.id !== deleteId)); setDeleteId(null); }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
