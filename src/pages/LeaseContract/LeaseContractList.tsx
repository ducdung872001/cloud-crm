import React, { useState, useMemo } from "react";
import {
  MOCK_LEASE_CONTRACTS, MOCK_PROJECTS, MOCK_CUSTOMERS,
  STATUS_LABELS, STATUS_COLORS,
} from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

const CONTRACT_TYPES = [
  { value: "residential", label: "Chung cư / Dân cư" },
  { value: "office", label: "Văn phòng" },
  { value: "industrial", label: "Khu công nghiệp" },
  { value: "retail", label: "Trung tâm thương mại" },
  { value: "villa", label: "Nhà thấp tầng" },
  { value: "government", label: "Hành chính công" },
];

function AddLeaseModal({ contract, onSave, onClose }: any) {
  const isEdit = !!contract?.id;
  const [form, setForm] = useState({
    code: "", customerId: "", projectId: "", unitCode: "", contractType: "office",
    startDate: "", endDate: "", rentAmount: 0, depositAmount: 0,
    paymentTerms: "monthly", reviewClause: 0, escalationRate: 0,
    turnoverRentRate: 0, note: "", status: "active",
    ...contract,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Sửa hợp đồng thuê" : "📄 Thêm hợp đồng thuê"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Mã hợp đồng <span className="required">*</span></label>
              <input className="form-control" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="HD-THUE-001" required />
            </div>
            <div className="form-group">
              <label>Loại hợp đồng</label>
              <select className="form-control" value={form.contractType} onChange={(e) => set("contractType", e.target.value)}>
                {CONTRACT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Khách hàng <span className="required">*</span></label>
              <select className="form-control" value={form.customerId} onChange={(e) => set("customerId", +e.target.value)}>
                <option value="">-- Chọn khách hàng --</option>
                {MOCK_CUSTOMERS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
              <label>Mã Unit / Căn</label>
              <input className="form-control" value={form.unitCode} onChange={(e) => set("unitCode", e.target.value)} placeholder="VD: A-1201" />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">Có hiệu lực</option>
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
              <label>Phí thuê / tháng (đ)</label>
              <input className="form-control" type="number" min={0} value={form.rentAmount} onChange={(e) => set("rentAmount", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tiền đặt cọc (đ)</label>
              <input className="form-control" type="number" min={0} value={form.depositAmount} onChange={(e) => set("depositAmount", +e.target.value)} />
            </div>

            <div className="form-group">
              <label>Kỳ thanh toán</label>
              <select className="form-control" value={form.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)}>
                <option value="monthly">Hàng tháng</option>
                <option value="quarterly">Hàng quý</option>
                <option value="semi-annual">6 tháng/lần</option>
                <option value="annual">Hàng năm</option>
              </select>
            </div>
            <div className="form-group">
              <label>Review giá (năm)</label>
              <input className="form-control" type="number" min={0} value={form.reviewClause} onChange={(e) => set("reviewClause", +e.target.value)} placeholder="Số năm review" />
            </div>

            <div className="form-group">
              <label>Tỷ lệ tăng giá (%/kỳ)</label>
              <input className="form-control" type="number" min={0} max={100} value={form.escalationRate} onChange={(e) => set("escalationRate", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phí doanh thu – Turnover Rent (%)</label>
              <input className="form-control" type="number" min={0} max={100} step={0.1} value={form.turnoverRentRate} onChange={(e) => set("turnoverRentRate", +e.target.value)} placeholder="Chỉ áp dụng với TTTM" />
            </div>

            <div className="form-group form-group--full">
              <label>Ghi chú / Điều khoản đặc biệt</label>
              <textarea className="form-control" rows={3} value={form.note} onChange={(e) => set("note", e.target.value)} />
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

export default function LeaseContractList() {
  document.title = "Hợp đồng thuê – TNPM";

  const [contracts, setContracts] = useState(MOCK_LEASE_CONTRACTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() =>
    contracts.filter((c) => {
      const q = search.toLowerCase();
      return (
        (!search || c.code.toLowerCase().includes(q) || c.customerName.toLowerCase().includes(q) || c.unitCode?.toLowerCase().includes(q)) &&
        (!filterStatus || c.status === filterStatus) &&
        (!filterType || c.contractType === filterType)
      );
    }), [contracts, search, filterStatus, filterType]);

  const handleSave = (data: any) => {
    if (data.id) setContracts((p) => p.map((c) => (c.id === data.id ? data : c)));
    else setContracts((p) => [...p, { ...data, id: Date.now() }]);
    setShowModal(false); setEditing(null);
  };

  const totalRent = filtered.filter(c => c.status === "active").reduce((a, c) => a + (c.rentAmount || 0), 0);

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📄 Hợp đồng thuê</h1>
          <p className="page-sub">Lease Management – Quản lý toàn bộ hợp đồng thuê mặt bằng</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Thêm hợp đồng</button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Tổng HĐ", value: filtered.length, color: "#1890ff" },
          { label: "Đang hiệu lực", value: filtered.filter(c => c.status === "active").length, color: "#52c41a" },
          { label: "Sắp hết hạn (30 ngày)", value: 1, color: "#faad14" },
          { label: "Tổng phí thuê / tháng", value: `${(totalRent / 1e6).toFixed(0)}tr đ`, color: "#722ed1" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="🔍 Tìm mã HĐ, khách hàng, unit..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Có hiệu lực</option>
          <option value="pending">Chờ ký</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Tất cả loại HĐ</option>
          {CONTRACT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <span className="result-count">{filtered.length} hợp đồng</span>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã HĐ</th>
              <th>Khách hàng</th>
              <th>Dự án</th>
              <th>Unit</th>
              <th>Loại HĐ</th>
              <th>Hiệu lực</th>
              <th>Phí thuê/tháng</th>
              <th>Tiền cọc</th>
              <th>TT định kỳ</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={11} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có hợp đồng nào</td></tr>
            )}
            {filtered.map((c) => {
              const project = MOCK_PROJECTS.find((p) => p.id === c.projectId);
              return (
                <tr key={c.id}>
                  <td><span className="code-text">{c.code}</span></td>
                  <td style={{ fontWeight: 500 }}>{c.customerName}</td>
                  <td style={{ fontSize: 12, color: "#595959" }}>{project?.name || "—"}</td>
                  <td><span className="code-text">{c.unitCode}</span></td>
                  <td>{CONTRACT_TYPES.find(t => t.value === c.contractType)?.label || c.contractType}</td>
                  <td style={{ fontSize: 12 }}>{c.startDate}<br /><span style={{ color: "#8c8c8c" }}>→ {c.endDate}</span></td>
                  <td className="amount-text">{fmtMoney(c.rentAmount)}</td>
                  <td className="amount-text">{fmtMoney(c.depositAmount)}</td>
                  <td style={{ fontSize: 12 }}>
                    {{ monthly: "Hàng tháng", quarterly: "Hàng quý", "semi-annual": "6 tháng", annual: "Hàng năm" }[c.paymentTerms] || c.paymentTerms}
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: `${STATUS_COLORS[c.status]}22`, color: STATUS_COLORS[c.status] }}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="action-btn action-btn--edit" onClick={() => { setEditing(c); setShowModal(true); }} title="Sửa">✏️</button>
                      <button className="action-btn action-btn--delete" onClick={() => setDeleteId(c.id)} title="Xóa">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && <AddLeaseModal contract={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Xác nhận xóa</h3>
            <p>Xóa hợp đồng này sẽ ảnh hưởng đến dữ liệu hóa đơn liên quan. Tiếp tục?</p>
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
