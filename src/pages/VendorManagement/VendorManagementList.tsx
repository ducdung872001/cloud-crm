import React, { useState, useMemo } from "react";
import {
  MOCK_VENDORS, MOCK_VENDOR_CONTRACTS, MOCK_VENDOR_INVOICES,
  VENDOR_SERVICE_TYPES, STATUS_LABELS, STATUS_COLORS,
} from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

function StarRating({ value }: { value: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(value) ? "#faad14" : "#d9d9d9", fontSize: 14 }}>★</span>
      ))}
      <span style={{ fontSize: 11, color: "#8c8c8c", marginLeft: 4 }}>({value})</span>
    </span>
  );
}

function AddVendorModal({ vendor, onSave, onClose }: any) {
  const isEdit = !!vendor?.id;
  const [form, setForm] = useState({
    code: "", name: "", shortName: "", taxCode: "",
    serviceTypes: [] as string[], contactName: "", phone: "", email: "",
    status: "active", note: "",
    ...vendor,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleService = (val: string) =>
    setForm((f) => ({
      ...f,
      serviceTypes: f.serviceTypes.includes(val) ? f.serviceTypes.filter((s) => s !== val) : [...f.serviceTypes, val],
    }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Sửa nhà cung cấp" : "🏭 Thêm nhà cung cấp"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Mã NCC <span className="required">*</span></label>
              <input className="form-control" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="NCC-001" required />
            </div>
            <div className="form-group">
              <label>Mã số thuế</label>
              <input className="form-control" value={form.taxCode} onChange={(e) => set("taxCode", e.target.value)} placeholder="0123456789" />
            </div>
            <div className="form-group form-group--full">
              <label>Tên nhà cung cấp <span className="required">*</span></label>
              <input className="form-control" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Tên đầy đủ" required />
            </div>
            <div className="form-group">
              <label>Tên ngắn</label>
              <input className="form-control" value={form.shortName} onChange={(e) => set("shortName", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">Đang hoạt động</option>
                <option value="suspended">Tạm dừng</option>
                <option value="blacklisted">Blacklist</option>
              </select>
            </div>
            <div className="form-group">
              <label>Người liên hệ</label>
              <input className="form-control" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input className="form-control" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
          </div>

          {/* Service types checkboxes */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#595959", display: "block", marginBottom: 10 }}>Loại dịch vụ cung cấp</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {VENDOR_SERVICE_TYPES.map((svc) => (
                <label key={svc.value} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.serviceTypes.includes(svc.value)}
                    onChange={() => toggleService(svc.value)}
                  />
                  {svc.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group form-group--full" style={{ marginTop: 16 }}>
            <label>Ghi chú / Lịch sử hợp tác</label>
            <textarea className="form-control" rows={3} value={form.note} onChange={(e) => set("note", e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...vendor, ...form })}>
            {isEdit ? "Lưu thay đổi" : "Thêm NCC"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VendorDetailModal({ vendor, onClose }: any) {
  const contracts = MOCK_VENDOR_CONTRACTS.filter(c => c.vendorId === vendor.id);
  const invoices = MOCK_VENDOR_INVOICES.filter(i => i.vendorId === vendor.id);
  const [tab, setTab] = useState("info");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" style={{ maxWidth: 800, maxHeight: "85vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🏭 {vendor.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #f0f0f0", padding: "0 20px", background: "#fafafa" }}>
          {["info", "contracts", "invoices"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "10px 18px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13,
                fontWeight: tab === t ? 600 : 400, color: tab === t ? "#1890ff" : "#8c8c8c",
                borderBottom: tab === t ? "2px solid #1890ff" : "2px solid transparent" }}>
              {{ info: "Thông tin", contracts: `Hợp đồng (${contracts.length})`, invoices: `Hóa đơn (${invoices.length})` }[t]}
            </button>
          ))}
        </div>
        <div className="modal-body">
          {tab === "info" && (
            <div>
              <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  {[
                    { l: "Mã NCC", v: vendor.code },
                    { l: "MST", v: vendor.taxCode },
                    { l: "Người liên hệ", v: vendor.contactName },
                    { l: "SĐT", v: vendor.phone },
                    { l: "Email", v: vendor.email },
                    { l: "Số HĐ", v: vendor.contractCount },
                  ].map((i, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <span style={{ width: 140, fontSize: 13, color: "#8c8c8c", flexShrink: 0 }}>{i.l}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{i.v || "—"}</span>
                    </div>
                  ))}
                </div>
                <div style={{ width: 180, background: "#fafafa", borderRadius: 10, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🏭</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{vendor.shortName}</div>
                  <div style={{ marginTop: 8 }}><StarRating value={vendor.rating} /></div>
                  <span className="status-badge" style={{ background: `${STATUS_COLORS[vendor.status]}22`, color: STATUS_COLORS[vendor.status], marginTop: 8, display: "inline-block" }}>
                    {STATUS_LABELS[vendor.status]}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#595959", marginBottom: 8 }}>Loại dịch vụ</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {vendor.serviceTypes.map((svc) => (
                    <span key={svc} style={{ padding: "4px 12px", borderRadius: 20, background: "#e6f7ff", color: "#1890ff", fontSize: 12 }}>
                      {VENDOR_SERVICE_TYPES.find(t => t.value === svc)?.label || svc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === "contracts" && (
            <table className="data-table">
              <thead><tr><th>Dự án</th><th>Dịch vụ</th><th>Giá trị HĐ</th><th>Hiệu lực</th><th>SLA</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {contracts.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "#8c8c8c", padding: 20 }}>Chưa có hợp đồng</td></tr>}
                {contracts.map((c) => (
                  <tr key={c.id}>
                    <td>{c.projectName}</td>
                    <td>{c.serviceType}</td>
                    <td className="amount-text">{fmtMoney(c.value)}</td>
                    <td style={{ fontSize: 12 }}>{c.startDate} → {c.endDate}</td>
                    <td>{c.slaDays === 0 ? "24/7" : `${c.slaDays} ngày`}</td>
                    <td><span className="status-badge" style={{ background: `${STATUS_COLORS[c.status]}22`, color: STATUS_COLORS[c.status] }}>{STATUS_LABELS[c.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "invoices" && (
            <table className="data-table">
              <thead><tr><th>Mã hóa đơn</th><th>Kỳ</th><th>Số tiền</th><th>Ngày nộp</th><th>3-Way Match</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {invoices.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "#8c8c8c", padding: 20 }}>Chưa có hóa đơn</td></tr>}
                {invoices.map((i) => (
                  <tr key={i.id}>
                    <td><span className="code-text">{i.code}</span></td>
                    <td>{i.period}</td>
                    <td className="amount-text">{fmtMoney(i.amount)}</td>
                    <td style={{ fontSize: 12 }}>{i.submittedAt}</td>
                    <td style={{ textAlign: "center" }}>
                      {i.matchPO && i.matchAcceptance ? <span style={{ color: "#52c41a" }}>✅ Đạt</span> : <span style={{ color: "#ff4d4f" }}>❌ Chưa đạt</span>}
                    </td>
                    <td><span className="status-badge" style={{ background: `${STATUS_COLORS[i.approvalStatus]}22`, color: STATUS_COLORS[i.approvalStatus] }}>{STATUS_LABELS[i.approvalStatus]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VendorManagementList() {
  document.title = "Quản lý Nhà cung cấp – TNPM";

  const [vendors, setVendors] = useState(MOCK_VENDORS);
  const [search, setSearch] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [detailVendor, setDetailVendor] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => vendors.filter((v) => {
    const q = search.toLowerCase();
    return (
      (!search || v.name.toLowerCase().includes(q) || v.code.toLowerCase().includes(q) || v.contactName.toLowerCase().includes(q)) &&
      (!filterService || v.serviceTypes.includes(filterService)) &&
      (!filterStatus || v.status === filterStatus)
    );
  }), [vendors, search, filterService, filterStatus]);

  const handleSave = (data: any) => {
    if (data.id) setVendors((p) => p.map((v) => (v.id === data.id ? data : v)));
    else setVendors((p) => [...p, { ...data, id: Date.now(), rating: 0, contractCount: 0, blacklisted: false }]);
    setShowModal(false); setEditing(null);
  };

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏭 Quản lý Nhà cung cấp</h1>
          <p className="page-sub">Vendor Management – Danh sách NCC, hợp đồng, đánh giá KPI</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Thêm NCC</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Tổng NCC", value: vendors.length, color: "#1890ff" },
          { label: "Đang hoạt động", value: vendors.filter(v => v.status === "active").length, color: "#52c41a" },
          { label: "Tạm dừng", value: vendors.filter(v => v.status === "suspended").length, color: "#faad14" },
          { label: "Rating trung bình", value: (vendors.reduce((a, v) => a + v.rating, 0) / vendors.length).toFixed(1) + " ⭐", color: "#fa8c16" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="🔍 Tìm NCC, người liên hệ..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="filter-select" value={filterService} onChange={(e) => setFilterService(e.target.value)}>
          <option value="">Tất cả dịch vụ</option>
          {VENDOR_SERVICE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="suspended">Tạm dừng</option>
          <option value="blacklisted">Blacklist</option>
        </select>
        <span className="result-count">{filtered.length} nhà cung cấp</span>
      </div>

      {/* Card Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {filtered.map((v) => (
          <div key={v.id}
            style={{ background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,.06)", cursor: "pointer", transition: "all 0.2s", border: v.blacklisted ? "2px solid #ff4d4f" : "1px solid transparent" }}
            onClick={() => setDetailVendor(v)}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 20px rgba(24,144,255,.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.06)")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: "#1890ff", fontFamily: "monospace" }}>{v.code}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginTop: 2 }}>{v.name}</div>
              </div>
              <span className="status-badge" style={{ height: "fit-content", background: `${STATUS_COLORS[v.status]}22`, color: STATUS_COLORS[v.status] }}>
                {STATUS_LABELS[v.status]}
              </span>
            </div>

            <div style={{ fontSize: 12, color: "#595959", marginBottom: 10 }}>
              👤 {v.contactName} &nbsp;|&nbsp; 📞 {v.phone}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {v.serviceTypes.slice(0, 3).map((svc) => (
                <span key={svc} style={{ padding: "2px 8px", borderRadius: 12, background: "#e6f7ff", color: "#1890ff", fontSize: 11 }}>
                  {VENDOR_SERVICE_TYPES.find(t => t.value === svc)?.label || svc}
                </span>
              ))}
              {v.serviceTypes.length > 3 && (
                <span style={{ padding: "2px 8px", borderRadius: 12, background: "#f0f0f0", color: "#8c8c8c", fontSize: 11 }}>
                  +{v.serviceTypes.length - 3}
                </span>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <StarRating value={v.rating} />
              </div>
              <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                <button className="action-btn action-btn--edit" onClick={() => { setEditing(v); setShowModal(true); }} title="Sửa">✏️</button>
                <button className="action-btn action-btn--delete" onClick={() => setDeleteId(v.id)} title="Xóa">🗑️</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: "1/-1" }}>
            <span style={{ fontSize: 48 }}>🏭</span>
            <p>Không tìm thấy nhà cung cấp nào</p>
          </div>
        )}
      </div>

      {showModal && <AddVendorModal vendor={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />}
      {detailVendor && <VendorDetailModal vendor={detailVendor} onClose={() => setDetailVendor(null)} />}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Xóa nhà cung cấp</h3>
            <p>Bạn có chắc muốn xóa NCC này?</p>
            <div className="confirm-dialog__actions">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={() => { setVendors(p => p.filter(v => v.id !== deleteId)); setDeleteId(null); }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
