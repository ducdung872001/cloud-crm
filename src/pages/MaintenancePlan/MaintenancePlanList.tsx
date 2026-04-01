import React, { useState, useMemo } from "react";
import {
  MOCK_MAINTENANCE_PLANS, MOCK_PROJECTS, MOCK_VENDORS,
  SERVICE_REQUEST_CATEGORIES, STATUS_LABELS, STATUS_COLORS,
} from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

function AddMaintenanceModal({ plan, onSave, onClose }: any) {
  const isEdit = !!plan?.id;
  const [form, setForm] = useState({
    code: "", projectId: "", category: "maintenance", title: "", description: "",
    vendorId: "", plannedDate: "", estimatedCost: 0, actualCost: 0,
    frequency: "quarterly", status: "scheduled", note: "",
    ...plan,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Cập nhật kế hoạch" : "📅 Tạo kế hoạch bảo trì"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Mã kế hoạch</label>
              <input className="form-control" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="MP-2024-001" />
            </div>
            <div className="form-group">
              <label>Tần suất</label>
              <select className="form-control" value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
                <option value="quarterly">Hàng quý</option>
                <option value="semi-annual">6 tháng/lần</option>
                <option value="annual">Hàng năm</option>
                <option value="one-time">Một lần</option>
              </select>
            </div>

            <div className="form-group">
              <label>Dự án <span className="required">*</span></label>
              <select className="form-control" value={form.projectId} onChange={(e) => set("projectId", +e.target.value)}>
                <option value="">-- Chọn dự án --</option>
                {MOCK_PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <select className="form-control" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {SERVICE_REQUEST_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div className="form-group form-group--full">
              <label>Tiêu đề kế hoạch <span className="required">*</span></label>
              <input className="form-control" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="VD: Bảo trì định kỳ thang máy Q2/2024" required />
            </div>

            <div className="form-group">
              <label>NCC thực hiện</label>
              <select className="form-control" value={form.vendorId} onChange={(e) => set("vendorId", +e.target.value)}>
                <option value="">-- Chưa chọn --</option>
                {MOCK_VENDORS.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ngày lên kế hoạch</label>
              <input className="form-control" type="date" value={form.plannedDate} onChange={(e) => set("plannedDate", e.target.value)} />
            </div>

            <div className="form-group">
              <label>Chi phí dự kiến (đ)</label>
              <input className="form-control" type="number" min={0} value={form.estimatedCost} onChange={(e) => set("estimatedCost", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Chi phí thực tế (đ)</label>
              <input className="form-control" type="number" min={0} value={form.actualCost} onChange={(e) => set("actualCost", +e.target.value)} />
            </div>

            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="scheduled">Đã lên lịch</option>
                <option value="in_progress">Đang thực hiện</option>
                <option value="resolved">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div className="form-group form-group--full">
              <label>Mô tả / Ghi chú</label>
              <textarea className="form-control" rows={3} value={form.note} onChange={(e) => set("note", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...plan, ...form })}>
            {isEdit ? "Lưu thay đổi" : "Tạo kế hoạch"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MaintenancePlanList() {
  document.title = "Kế hoạch Bảo trì – TNPM";

  const [plans, setPlans] = useState(MOCK_MAINTENANCE_PLANS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => plans.filter((p) => {
    const q = search.toLowerCase();
    return (
      (!search || p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)) &&
      (!filterStatus || p.status === filterStatus) &&
      (!filterProject || String(p.projectId) === filterProject) &&
      (!filterCategory || p.category === filterCategory)
    );
  }), [plans, search, filterStatus, filterProject, filterCategory]);

  const handleSave = (data: any) => {
    if (data.id) setPlans((p) => p.map((x) => (x.id === data.id ? data : x)));
    else setPlans((p) => [...p, { ...data, id: Date.now() }]);
    setShowModal(false); setEditing(null);
  };

  const totalEstimated = filtered.reduce((a, p) => a + (p.estimatedCost || 0), 0);

  const FREQ_LABELS: Record<string, string> = {
    weekly: "Hàng tuần", monthly: "Hàng tháng", quarterly: "Hàng quý",
    "semi-annual": "6 tháng", annual: "Hàng năm", "one-time": "Một lần",
  };

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Kế hoạch Bảo trì</h1>
          <p className="page-sub">Maintenance Plan – Lên lịch & theo dõi bảo trì định kỳ tòa nhà</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Tạo kế hoạch</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Tổng kế hoạch", value: plans.length, color: "#1890ff" },
          { label: "Đã lên lịch", value: plans.filter(p => p.status === "scheduled").length, color: "#faad14" },
          { label: "Đang thực hiện", value: plans.filter(p => p.status === "in_progress").length, color: "#1890ff" },
          { label: "Chi phí dự kiến", value: fmtMoney(totalEstimated), color: "#722ed1" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="🔍 Tìm tiêu đề, mã kế hoạch..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="scheduled">Đã lên lịch</option>
          <option value="in_progress">Đang thực hiện</option>
          <option value="resolved">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          {SERVICE_REQUEST_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className="filter-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">Tất cả dự án</option>
          {MOCK_PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <span className="result-count">{filtered.length} kế hoạch</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {filtered.map((plan) => {
          const vendor = MOCK_VENDORS.find(v => v.id === plan.vendorId);
          const cat = SERVICE_REQUEST_CATEGORIES.find(c => c.value === plan.category);
          return (
            <div key={plan.id} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${STATUS_COLORS[plan.status]}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "#1890ff", fontFamily: "monospace" }}>{plan.code}</span>
                <span className="status-badge" style={{ background: `${STATUS_COLORS[plan.status]}22`, color: STATUS_COLORS[plan.status] }}>
                  {STATUS_LABELS[plan.status]}
                </span>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", margin: "0 0 10px" }}>{plan.title}</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12, fontSize: 12 }}>
                <div><span style={{ color: "#8c8c8c" }}>🏢 Dự án:</span><br /><b>{plan.projectName}</b></div>
                <div><span style={{ color: "#8c8c8c" }}>📋 Danh mục:</span><br /><b>{cat?.label || plan.category}</b></div>
                <div><span style={{ color: "#8c8c8c" }}>🏭 NCC:</span><br /><b>{vendor?.shortName || plan.vendorName || "—"}</b></div>
                <div><span style={{ color: "#8c8c8c" }}>🔄 Tần suất:</span><br /><b>{FREQ_LABELS[plan.frequency] || plan.frequency}</b></div>
                <div><span style={{ color: "#8c8c8c" }}>📅 Ngày:</span><br /><b>{plan.plannedDate}</b></div>
                <div><span style={{ color: "#8c8c8c" }}>💰 Dự kiến:</span><br /><b style={{ color: "#722ed1" }}>{fmtMoney(plan.estimatedCost)}</b></div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="action-btn action-btn--edit" onClick={() => { setEditing(plan); setShowModal(true); }} title="Sửa">✏️</button>
                <button className="action-btn action-btn--delete" onClick={() => setDeleteId(plan.id)} title="Xóa">🗑️</button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: "1/-1" }}>
            <span style={{ fontSize: 48 }}>📅</span>
            <p>Không có kế hoạch bảo trì nào</p>
          </div>
        )}
      </div>

      {showModal && <AddMaintenanceModal plan={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Xóa kế hoạch</h3>
            <p>Bạn có chắc muốn xóa kế hoạch bảo trì này?</p>
            <div className="confirm-dialog__actions">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={() => { setPlans(p => p.filter(x => x.id !== deleteId)); setDeleteId(null); }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
