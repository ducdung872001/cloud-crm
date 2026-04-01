import React, { useState, useMemo } from "react";
import { MOCK_SERVICE_CONTRACTS, MOCK_PROJECTS, MOCK_CUSTOMERS, STATUS_LABELS, STATUS_COLORS } from "assets/mock/TNPMData";

const SERVICE_ITEMS = [
  { key: "management_fee", label: "Phí quản lý (đ/m²/tháng)" },
  { key: "parking", label: "Gửi xe" },
  { key: "electricity", label: "Điện" },
  { key: "water", label: "Nước" },
  { key: "cleaning", label: "Vệ sinh" },
  { key: "security", label: "An ninh" },
  { key: "cam_fee", label: "CAM Charges" },
  { key: "marketing_levy", label: "Marketing Levy (%)" },
  { key: "utilities", label: "Tiện ích chung" },
  { key: "elevator", label: "Thang máy" },
  { key: "wifi", label: "Internet / Wifi" },
];

function AddServiceContractModal({ contract, onSave, onClose }: any) {
  const isEdit = !!contract?.id;
  const [form, setForm] = useState({
    code: "", customerId: "", projectId: "", unitId: "",
    services: [] as string[], startDate: "", endDate: "",
    managementFee: 0, parkingSlots: 0, parkingFee: 0,
    camFee: 0, marketingLevy: 0, status: "active", note: "",
    ...contract,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleService = (svc: string) =>
    setForm((f) => ({
      ...f,
      services: f.services.includes(svc) ? f.services.filter((s) => s !== svc) : [...f.services, svc],
    }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Sửa HĐ Dịch vụ" : "📝 Tạo HĐ Dịch vụ"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Mã HĐ DV <span className="required">*</span></label>
              <input className="form-control" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="HD-DV-001" />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">Có hiệu lực</option>
                <option value="pending">Chờ ký</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            <div className="form-group">
              <label>Khách hàng <span className="required">*</span></label>
              <select className="form-control" value={form.customerId} onChange={(e) => set("customerId", +e.target.value)}>
                <option value="">-- Chọn KH --</option>
                {MOCK_CUSTOMERS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Dự án</label>
              <select className="form-control" value={form.projectId} onChange={(e) => set("projectId", +e.target.value)}>
                <option value="">-- Chọn dự án --</option>
                {MOCK_PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input className="form-control" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input className="form-control" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </div>
          </div>

          {/* Services */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: "#595959" }}>Các dịch vụ được cung cấp</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {SERVICE_ITEMS.map((svc) => (
                <label key={svc.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.services.includes(svc.key)} onChange={() => toggleService(svc.key)} />
                  {svc.label}
                </label>
              ))}
            </div>
          </div>

          {/* Fee config */}
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {form.services.includes("management_fee") && (
              <div className="form-group">
                <label>Phí QL (đ/m²/tháng)</label>
                <input className="form-control" type="number" min={0} value={form.managementFee} onChange={(e) => set("managementFee", +e.target.value)} />
              </div>
            )}
            {form.services.includes("parking") && (
              <>
                <div className="form-group">
                  <label>Số chỗ gửi xe</label>
                  <input className="form-control" type="number" min={0} value={form.parkingSlots} onChange={(e) => set("parkingSlots", +e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Phí gửi xe/tháng (đ)</label>
                  <input className="form-control" type="number" min={0} value={form.parkingFee} onChange={(e) => set("parkingFee", +e.target.value)} />
                </div>
              </>
            )}
            {form.services.includes("cam_fee") && (
              <div className="form-group">
                <label>CAM Charges/tháng (đ)</label>
                <input className="form-control" type="number" min={0} value={form.camFee} onChange={(e) => set("camFee", +e.target.value)} />
              </div>
            )}
            {form.services.includes("marketing_levy") && (
              <div className="form-group">
                <label>Marketing Levy (%)</label>
                <input className="form-control" type="number" min={0} max={100} step={0.1} value={form.marketingLevy} onChange={(e) => set("marketingLevy", +e.target.value)} />
              </div>
            )}
          </div>

          <div className="form-group form-group--full" style={{ marginTop: 12 }}>
            <label>Ghi chú</label>
            <textarea className="form-control" rows={2} value={form.note} onChange={(e) => set("note", e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...contract, ...form })}>
            {isEdit ? "Lưu" : "Tạo HĐ dịch vụ"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServiceContractList() {
  document.title = "Hợp đồng Dịch vụ – TNPM";

  const [contracts, setContracts] = useState(MOCK_SERVICE_CONTRACTS);
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => contracts.filter((c) => {
    const q = search.toLowerCase();
    return (
      (!search || c.code.toLowerCase().includes(q)) &&
      (!filterProject || String(c.projectId) === filterProject)
    );
  }), [contracts, search, filterProject]);

  const handleSave = (data: any) => {
    if (data.id) setContracts((p) => p.map((c) => (c.id === data.id ? data : c)));
    else setContracts((p) => [...p, { ...data, id: Date.now() }]);
    setShowModal(false); setEditing(null);
  };

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📝 Hợp đồng Dịch vụ</h1>
          <p className="page-sub">Service Contract – Phí quản lý, điện, nước, gửi xe, CAM, marketing levy...</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Tạo HĐ dịch vụ</button>
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="🔍 Tìm mã HĐ..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="filter-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">Tất cả dự án</option>
          {MOCK_PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <span className="result-count">{filtered.length} hợp đồng</span>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã HĐ DV</th>
              <th>Khách hàng</th>
              <th>Dự án</th>
              <th>Dịch vụ đăng ký</th>
              <th>Phí QL (đ/m²)</th>
              <th>Gửi xe</th>
              <th>Hiệu lực</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có HĐ dịch vụ nào</td></tr>
            )}
            {filtered.map((c) => {
              const customer = MOCK_CUSTOMERS.find((k) => k.id === c.customerId);
              const project = MOCK_PROJECTS.find((p) => p.id === c.projectId);
              return (
                <tr key={c.id}>
                  <td><span className="code-text">{c.code}</span></td>
                  <td style={{ fontWeight: 500 }}>{customer?.name || "—"}</td>
                  <td style={{ fontSize: 12 }}>{project?.name || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 220 }}>
                      {c.services.slice(0, 4).map((svc) => (
                        <span key={svc} style={{ padding: "2px 7px", borderRadius: 10, background: "#e6f7ff", color: "#1890ff", fontSize: 10 }}>
                          {SERVICE_ITEMS.find(s => s.key === svc)?.label?.split(" ")[0] || svc}
                        </span>
                      ))}
                      {c.services.length > 4 && <span style={{ fontSize: 10, color: "#8c8c8c" }}>+{c.services.length - 4}</span>}
                    </div>
                  </td>
                  <td>{c.managementFee > 0 ? `${c.managementFee.toLocaleString("vi-VN")} đ` : "—"}</td>
                  <td>{c.parkingSlots > 0 ? `${c.parkingSlots} chỗ` : "—"}</td>
                  <td style={{ fontSize: 12 }}>{c.startDate}<br /><span style={{ color: "#8c8c8c" }}>→ {c.endDate}</span></td>
                  <td>
                    <span className="status-badge" style={{ background: `${STATUS_COLORS[c.status]}22`, color: STATUS_COLORS[c.status] }}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="action-btn action-btn--edit" onClick={() => { setEditing(c); setShowModal(true); }}>✏️</button>
                      <button className="action-btn action-btn--delete" onClick={() => setDeleteId(c.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && <AddServiceContractModal contract={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Xóa HĐ dịch vụ</h3>
            <p>Bạn có chắc muốn xóa hợp đồng dịch vụ này?</p>
            <div className="confirm-dialog__actions">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={() => { setContracts(p => p.filter(c => c.id !== deleteId)); setDeleteId(null); }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
