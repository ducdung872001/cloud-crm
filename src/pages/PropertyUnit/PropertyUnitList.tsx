import React, { useState, useMemo } from "react";
import { MOCK_UNITS, MOCK_PROJECTS, STATUS_LABELS, STATUS_COLORS } from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

function AddUnitModal({ unit, onSave, onClose }: any) {
  const isEdit = !!unit?.id;
  const [form, setForm] = useState({
    code: "", projectId: "", floor: 0, block: "", area: 0,
    bedrooms: 0, bathrooms: 0, unitType: "apartment",
    rentPrice: 0, status: "available", note: "",
    ...unit,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const UNIT_TYPES = [
    { value: "apartment", label: "Căn hộ" },
    { value: "office", label: "Văn phòng" },
    { value: "factory", label: "Nhà xưởng / Kho" },
    { value: "retail_shop", label: "Mặt bằng bán lẻ" },
    { value: "villa", label: "Biệt thự / Nhà phố" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Sửa Unit" : "🏠 Thêm Unit mới"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Mã Unit <span className="required">*</span></label>
              <input className="form-control" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="A-1201" required />
            </div>
            <div className="form-group">
              <label>Dự án <span className="required">*</span></label>
              <select className="form-control" value={form.projectId} onChange={(e) => set("projectId", +e.target.value)}>
                <option value="">-- Chọn dự án --</option>
                {MOCK_PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Loại unit</label>
              <select className="form-control" value={form.unitType} onChange={(e) => set("unitType", e.target.value)}>
                {UNIT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="available">Còn trống</option>
                <option value="occupied">Đang thuê</option>
                <option value="maintenance">Đang bảo trì</option>
                <option value="reserved">Đã đặt cọc</option>
              </select>
            </div>
            <div className="form-group">
              <label>Block / Tòa</label>
              <input className="form-control" value={form.block} onChange={(e) => set("block", e.target.value)} placeholder="Block A" />
            </div>
            <div className="form-group">
              <label>Tầng</label>
              <input className="form-control" type="number" min={-5} value={form.floor} onChange={(e) => set("floor", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Diện tích (m²)</label>
              <input className="form-control" type="number" min={0} step={0.1} value={form.area} onChange={(e) => set("area", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Giá thuê / tháng (đ)</label>
              <input className="form-control" type="number" min={0} value={form.rentPrice} onChange={(e) => set("rentPrice", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Số phòng ngủ</label>
              <input className="form-control" type="number" min={0} max={10} value={form.bedrooms} onChange={(e) => set("bedrooms", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Số phòng tắm</label>
              <input className="form-control" type="number" min={0} max={10} value={form.bathrooms} onChange={(e) => set("bathrooms", +e.target.value)} />
            </div>
            <div className="form-group form-group--full">
              <label>Ghi chú</label>
              <textarea className="form-control" rows={2} value={form.note} onChange={(e) => set("note", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...unit, ...form })}>
            {isEdit ? "Lưu thay đổi" : "Thêm Unit"}
          </button>
        </div>
      </div>
    </div>
  );
}

const UNIT_TYPE_LABELS: Record<string, string> = {
  apartment: "Căn hộ", office: "Văn phòng", factory: "Nhà xưởng",
  retail_shop: "Mặt bằng", villa: "Biệt thự",
};

export default function PropertyUnitList() {
  document.title = "Quản lý Unit – TNPM";

  const [units, setUnits] = useState(MOCK_UNITS);
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const filtered = useMemo(() => units.filter((u) => {
    const q = search.toLowerCase();
    return (
      (!search || u.code.toLowerCase().includes(q) || u.block?.toLowerCase().includes(q)) &&
      (!filterProject || String(u.projectId) === filterProject) &&
      (!filterStatus || u.status === filterStatus) &&
      (!filterType || u.unitType === filterType)
    );
  }), [units, search, filterProject, filterStatus, filterType]);

  const handleSave = (data: any) => {
    if (data.id) setUnits((p) => p.map((u) => (u.id === data.id ? data : u)));
    else setUnits((p) => [...p, { ...data, id: Date.now() }]);
    setShowModal(false); setEditing(null);
  };

  const stats = {
    total: filtered.length,
    available: filtered.filter(u => u.status === "available").length,
    occupied: filtered.filter(u => u.status === "occupied").length,
    totalArea: filtered.reduce((a, u) => a + (u.area || 0), 0),
    avgRent: filtered.length ? Math.round(filtered.reduce((a, u) => a + (u.rentPrice || 0), 0) / filtered.length) : 0,
  };

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏠 Quản lý Unit / Căn hộ</h1>
          <p className="page-sub">Danh sách tất cả unit trong toàn bộ dự án portfolio TNPM</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className={`btn ${viewMode === "table" ? "btn-primary" : "btn-outline"}`} onClick={() => setViewMode("table")}>☰ Bảng</button>
          <button className={`btn ${viewMode === "grid" ? "btn-primary" : "btn-outline"}`} onClick={() => setViewMode("grid")}>⊞ Lưới</button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Thêm Unit</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Tổng Unit", value: stats.total, color: "#1890ff" },
          { label: "Còn trống", value: stats.available, color: "#52c41a" },
          { label: "Đang thuê", value: stats.occupied, color: "#fa8c16" },
          { label: "Tổng diện tích", value: `${stats.totalArea.toLocaleString("vi-VN")} m²`, color: "#722ed1" },
          { label: "Giá thuê TB", value: fmtMoney(stats.avgRent), color: "#13c2c2" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input className="search-input" placeholder="🔍 Tìm mã unit, block..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="filter-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">Tất cả dự án</option>
          {MOCK_PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả TT</option>
          <option value="available">Còn trống</option>
          <option value="occupied">Đang thuê</option>
          <option value="maintenance">Bảo trì</option>
          <option value="reserved">Đã đặt cọc</option>
        </select>
        <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Tất cả loại</option>
          <option value="apartment">Căn hộ</option>
          <option value="office">Văn phòng</option>
          <option value="factory">Nhà xưởng</option>
          <option value="retail_shop">Mặt bằng</option>
          <option value="villa">Biệt thự</option>
        </select>
        <span className="result-count">{filtered.length} units</span>
      </div>

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã Unit</th>
                <th>Dự án</th>
                <th>Block / Tòa</th>
                <th>Tầng</th>
                <th>Loại</th>
                <th>DT (m²)</th>
                <th>Phòng ngủ</th>
                <th>Giá thuê/tháng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không tìm thấy unit nào</td></tr>
              )}
              {filtered.map((u) => {
                const project = MOCK_PROJECTS.find((p) => p.id === u.projectId);
                return (
                  <tr key={u.id}>
                    <td><span className="code-text">{u.code}</span></td>
                    <td style={{ fontSize: 12 }}>{project?.name || "—"}</td>
                    <td>{u.block}</td>
                    <td>Tầng {u.floor}</td>
                    <td style={{ fontSize: 12 }}>{UNIT_TYPE_LABELS[u.unitType] || u.unitType}</td>
                    <td>{u.area} m²</td>
                    <td style={{ textAlign: "center" }}>{u.bedrooms > 0 ? `${u.bedrooms} PN` : "—"}</td>
                    <td className="amount-text">{fmtMoney(u.rentPrice)}</td>
                    <td>
                      <span className="status-badge" style={{ background: `${STATUS_COLORS[u.status]}22`, color: STATUS_COLORS[u.status] }}>
                        {STATUS_LABELS[u.status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="action-btn action-btn--edit" onClick={() => { setEditing(u); setShowModal(true); }}>✏️</button>
                        <button className="action-btn action-btn--delete" onClick={() => setDeleteId(u.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {filtered.map((u) => {
            const project = MOCK_PROJECTS.find((p) => p.id === u.projectId);
            return (
              <div key={u.id}
                style={{
                  background: "#fff", borderRadius: 12, padding: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,.06)",
                  borderTop: `4px solid ${STATUS_COLORS[u.status] || "#d9d9d9"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="code-text" style={{ fontSize: 13, fontWeight: 700 }}>{u.code}</span>
                  <span className="status-badge" style={{ background: `${STATUS_COLORS[u.status]}22`, color: STATUS_COLORS[u.status], fontSize: 11 }}>
                    {STATUS_LABELS[u.status]}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#595959", marginBottom: 8 }}>
                  🏢 {project?.name}<br />
                  📍 {u.block} – Tầng {u.floor}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 10 }}>
                  <div><span style={{ color: "#8c8c8c" }}>DT:</span> <b>{u.area} m²</b></div>
                  <div><span style={{ color: "#8c8c8c" }}>Loại:</span> <b>{UNIT_TYPE_LABELS[u.unitType] || u.unitType}</b></div>
                  {u.bedrooms > 0 && <div><span style={{ color: "#8c8c8c" }}>PN:</span> <b>{u.bedrooms}</b></div>}
                  <div><span style={{ color: "#8c8c8c" }}>PT:</span> <b>{u.bathrooms}</b></div>
                </div>
                <div style={{ fontWeight: 700, color: "#722ed1", fontSize: 14, marginBottom: 10 }}>{fmtMoney(u.rentPrice)}/tháng</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button className="action-btn action-btn--edit" onClick={() => { setEditing(u); setShowModal(true); }}>✏️</button>
                  <button className="action-btn action-btn--delete" onClick={() => setDeleteId(u.id)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <AddUnitModal unit={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Xóa Unit</h3>
            <p>Xóa unit này sẽ ảnh hưởng đến hợp đồng liên quan. Tiếp tục?</p>
            <div className="confirm-dialog__actions">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={() => { setUnits(p => p.filter(u => u.id !== deleteId)); setDeleteId(null); }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
