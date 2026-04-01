import React, { useState, useMemo } from "react";
import {
  MOCK_VENDOR_CONTRACTS, MOCK_VENDORS, MOCK_PROJECTS,
  STATUS_LABELS, STATUS_COLORS,
} from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

const SLA_LABELS: Record<number, string> = {
  0: "24/7 – Ngay lập tức",
  1: "1 ngày làm việc",
  2: "2 ngày làm việc",
  3: "3 ngày làm việc",
  4: "4 ngày làm việc",
  5: "5 ngày làm việc",
  7: "1 tuần",
};

const PAYMENT_LABELS: Record<string, string> = {
  monthly: "Hàng tháng",
  quarterly: "Hàng quý",
  "semi-annual": "6 tháng/lần",
  annual: "Hàng năm",
};

function AddVendorContractModal({ contract, onSave, onClose }: any) {
  const isEdit = !!contract?.id;
  const [form, setForm] = useState({
    vendorId: "", projectId: "", serviceType: "maintenance",
    value: 0, startDate: "", endDate: "",
    slaDays: 2, paymentTerms: "monthly", status: "active", note: "",
    ...contract,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const SERVICE_TYPES = [
    { value: "maintenance", label: "Bảo trì tổng hợp" },
    { value: "cleaning", label: "Vệ sinh" },
    { value: "security", label: "Bảo vệ / An ninh" },
    { value: "elevator", label: "Thang máy" },
    { value: "fire_protection", label: "PCCC" },
    { value: "mep", label: "Cơ điện lạnh (MEP)" },
    { value: "pest_control", label: "Diệt côn trùng" },
    { value: "landscaping", label: "Cây xanh / Cảnh quan" },
    { value: "electrical", label: "Điện" },
    { value: "plumbing", label: "Cấp thoát nước" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Sửa HĐ NCC" : "📄 Thêm Hợp đồng NCC"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Nhà cung cấp <span className="required">*</span></label>
              <select className="form-control" value={form.vendorId} onChange={(e) => set("vendorId", +e.target.value)}>
                <option value="">-- Chọn NCC --</option>
                {MOCK_VENDORS.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Dự án <span className="required">*</span></label>
              <select className="form-control" value={form.projectId} onChange={(e) => set("projectId", +e.target.value)}>
                <option value="">-- Chọn dự án --</option>
                {MOCK_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Loại dịch vụ</label>
              <select className="form-control" value={form.serviceType} onChange={(e) => set("serviceType", e.target.value)}>
                {SERVICE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">Đang hiệu lực</option>
                <option value="pending">Chờ ký</option>
                <option value="cancelled">Đã hủy</option>
                <option value="expired">Hết hạn</option>
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
            <div className="form-group">
              <label>Giá trị hợp đồng (đ/năm)</label>
              <input className="form-control" type="number" min={0} value={form.value} onChange={(e) => set("value", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Thanh toán</label>
              <select className="form-control" value={form.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)}>
                <option value="monthly">Hàng tháng</option>
                <option value="quarterly">Hàng quý</option>
                <option value="semi-annual">6 tháng/lần</option>
                <option value="annual">Hàng năm</option>
              </select>
            </div>
            <div className="form-group">
              <label>SLA cam kết (ngày)</label>
              <select className="form-control" value={form.slaDays} onChange={(e) => set("slaDays", +e.target.value)}>
                <option value={0}>24/7 – Ngay lập tức</option>
                <option value={1}>1 ngày làm việc</option>
                <option value={2}>2 ngày làm việc</option>
                <option value={3}>3 ngày làm việc</option>
                <option value={4}>4 ngày làm việc</option>
                <option value={5}>5 ngày làm việc</option>
                <option value={7}>1 tuần</option>
              </select>
            </div>
            <div className="form-group form-group--full">
              <label>Ghi chú / Điều khoản đặc biệt</label>
              <textarea className="form-control" rows={3} value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="Các điều khoản, điều kiện thanh lý hợp đồng..." />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...contract, ...form })}>
            {isEdit ? "Lưu thay đổi" : "Tạo hợp đồng"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorContractList() {
  document.title = "Hợp đồng NCC – TNPM";

  const [contracts, setContracts] = useState(MOCK_VENDOR_CONTRACTS);
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterService, setFilterService] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => contracts.filter((c) => {
    const q = search.toLowerCase();
    return (
      (!search || c.vendorName?.toLowerCase().includes(q) || c.projectName?.toLowerCase().includes(q)) &&
      (!filterProject || String(c.projectId) === filterProject) &&
      (!filterStatus || c.status === filterStatus) &&
      (!filterService || c.serviceType === filterService)
    );
  }), [contracts, search, filterProject, filterStatus, filterService]);

  const handleSave = (data: any) => {
    const vendor = MOCK_VENDORS.find((v) => v.id === +data.vendorId);
    const project = MOCK_PROJECTS.find((p) => p.id === +data.projectId);
    const enriched = {
      ...data,
      vendorName: vendor?.shortName || vendor?.name || data.vendorName,
      projectName: project?.name || data.projectName,
    };
    if (data.id) setContracts((p) => p.map((c) => (c.id === data.id ? enriched : c)));
    else setContracts((p) => [...p, { ...enriched, id: Date.now() }]);
    setShowModal(false); setEditing(null);
  };

  const totalValue = filtered.reduce((a, c) => a + (c.value || 0), 0);
  const expiringSoon = filtered.filter((c) => {
    if (!c.endDate) return false;
    const days = (new Date(c.endDate).getTime() - Date.now()) / 86400000;
    return days > 0 && days <= 30;
  });

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📄 Hợp đồng Nhà cung cấp</h1>
          <p className="page-sub">Quản lý hợp đồng dịch vụ với NCC theo từng dự án</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          + Thêm HĐ NCC
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Tổng HĐ", value: contracts.length, color: "#1890ff" },
          { label: "Đang hiệu lực", value: contracts.filter(c => c.status === "active").length, color: "#52c41a" },
          { label: "Sắp hết hạn (≤30 ngày)", value: expiringSoon.length, color: "#faad14" },
          { label: "Tổng giá trị HĐ", value: fmtMoney(totalValue), color: "#722ed1" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Expiring soon alert */}
      {expiringSoon.length > 0 && (
        <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 10, padding: "12px 18px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ fontSize: 13, color: "#875500" }}>
            <b>{expiringSoon.length} hợp đồng</b> sắp hết hạn trong 30 ngày tới:&nbsp;
            {expiringSoon.map(c => c.vendorName).join(", ")}
          </span>
        </div>
      )}

      <div className="filter-bar">
        <input className="search-input" placeholder="🔍 Tìm NCC, dự án..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="filter-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">Tất cả dự án</option>
          {MOCK_PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="filter-select" value={filterService} onChange={(e) => setFilterService(e.target.value)}>
          <option value="">Tất cả DV</option>
          <option value="maintenance">Bảo trì</option>
          <option value="cleaning">Vệ sinh</option>
          <option value="security">An ninh</option>
          <option value="elevator">Thang máy</option>
          <option value="fire_protection">PCCC</option>
          <option value="mep">MEP</option>
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả TT</option>
          <option value="active">Đang hiệu lực</option>
          <option value="pending">Chờ ký</option>
          <option value="expired">Hết hạn</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <span className="result-count">{filtered.length} hợp đồng</span>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nhà cung cấp</th>
              <th>Dự án</th>
              <th>Loại DV</th>
              <th>Giá trị HĐ</th>
              <th>Hiệu lực</th>
              <th>SLA cam kết</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>
                  Không có hợp đồng NCC nào
                </td>
              </tr>
            )}
            {filtered.map((c) => {
              const daysLeft = c.endDate
                ? Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000)
                : null;
              const isWarning = daysLeft !== null && daysLeft <= 30 && daysLeft > 0;

              return (
                <tr key={c.id} style={{ background: isWarning ? "#fffbe6" : undefined }}>
                  <td style={{ fontWeight: 600 }}>{c.vendorName}</td>
                  <td style={{ fontSize: 12, color: "#595959" }}>{c.projectName}</td>
                  <td>
                    <span style={{ padding: "3px 10px", borderRadius: 12, background: "#e6f7ff", color: "#1890ff", fontSize: 12 }}>
                      {c.serviceType}
                    </span>
                  </td>
                  <td className="amount-text">{fmtMoney(c.value)}</td>
                  <td style={{ fontSize: 12 }}>
                    {c.startDate}<br />
                    <span style={{ color: isWarning ? "#faad14" : "#8c8c8c" }}>
                      → {c.endDate}
                      {isWarning && <b> ⚠️ còn {daysLeft}d</b>}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{SLA_LABELS[c.slaDays] ?? `${c.slaDays} ngày`}</td>
                  <td style={{ fontSize: 12 }}>{PAYMENT_LABELS[c.paymentTerms] ?? c.paymentTerms}</td>
                  <td>
                    <span className="status-badge" style={{ background: `${STATUS_COLORS[c.status]}22`, color: STATUS_COLORS[c.status] }}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="action-btn action-btn--edit" title="Sửa"
                        onClick={() => { setEditing(c); setShowModal(true); }}>✏️</button>
                      <button className="action-btn action-btn--delete" title="Xóa"
                        onClick={() => setDeleteId(c.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddVendorContractModal
          contract={editing}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Xóa hợp đồng NCC</h3>
            <p>Bạn có chắc muốn xóa hợp đồng này?</p>
            <div className="confirm-dialog__actions">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="btn btn-danger"
                onClick={() => { setContracts(p => p.filter(c => c.id !== deleteId)); setDeleteId(null); }}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
