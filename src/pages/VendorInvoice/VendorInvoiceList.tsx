import React, { useState, useMemo } from "react";
import {
  MOCK_VENDOR_INVOICES, MOCK_VENDORS, MOCK_VENDOR_CONTRACTS, MOCK_PROJECTS,
  STATUS_LABELS, STATUS_COLORS,
} from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

function AddVendorInvoiceModal({ invoice, onSave, onClose }: any) {
  const isEdit = !!invoice?.id;
  const [form, setForm] = useState({
    code: "", vendorId: "", vendorContractId: "", projectId: "",
    amount: 0, period: "", submittedAt: "", approvalStatus: "pending",
    matchPO: false, matchAcceptance: false, note: "",
    ...invoice,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const vendorContracts = MOCK_VENDOR_CONTRACTS.filter(c => !form.vendorId || c.vendorId === +form.vendorId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Sửa hóa đơn NCC" : "🧾 Nhập hóa đơn NCC"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Mã hóa đơn NCC</label>
              <input className="form-control" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="NVAT-2024-001" />
            </div>
            <div className="form-group">
              <label>Kỳ dịch vụ</label>
              <input className="form-control" value={form.period} onChange={(e) => set("period", e.target.value)} placeholder="2024-03" />
            </div>
            <div className="form-group">
              <label>Nhà cung cấp <span className="required">*</span></label>
              <select className="form-control" value={form.vendorId} onChange={(e) => set("vendorId", +e.target.value)}>
                <option value="">-- Chọn NCC --</option>
                {MOCK_VENDORS.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Hợp đồng NCC</label>
              <select className="form-control" value={form.vendorContractId} onChange={(e) => set("vendorContractId", +e.target.value)}>
                <option value="">-- Chọn HĐ --</option>
                {vendorContracts.map(c => <option key={c.id} value={c.id}>{c.projectName} – {c.serviceType}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Dự án</label>
              <select className="form-control" value={form.projectId} onChange={(e) => set("projectId", +e.target.value)}>
                <option value="">-- Chọn dự án --</option>
                {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Số tiền (đ)</label>
              <input className="form-control" type="number" min={0} value={form.amount} onChange={(e) => set("amount", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Ngày nộp</label>
              <input className="form-control" type="date" value={form.submittedAt} onChange={(e) => set("submittedAt", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Trạng thái duyệt</label>
              <select className="form-control" value={form.approvalStatus} onChange={(e) => set("approvalStatus", e.target.value)}>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
          </div>

          {/* 3-Way Match */}
          <div style={{ background: "#fafafa", borderRadius: 10, padding: 16, marginTop: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: "#1a1a2e" }}>✅ 3-Way Match Verification</div>
            <div style={{ display: "flex", gap: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
                <input type="checkbox" checked={form.matchPO} onChange={(e) => set("matchPO", e.target.checked)} style={{ width: 16, height: 16 }} />
                <div>
                  <div style={{ fontWeight: 500 }}>Match PO (Purchase Order)</div>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>Hóa đơn khớp với đơn đặt hàng</div>
                </div>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
                <input type="checkbox" checked={form.matchAcceptance} onChange={(e) => set("matchAcceptance", e.target.checked)} style={{ width: 16, height: 16 }} />
                <div>
                  <div style={{ fontWeight: 500 }}>Match Biên bản nghiệm thu</div>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>Đã có biên bản nghiệm thu ký xác nhận</div>
                </div>
              </label>
            </div>
            {form.matchPO && form.matchAcceptance && (
              <div style={{ marginTop: 10, padding: "8px 14px", background: "#f6ffed", borderRadius: 8, color: "#52c41a", fontSize: 13 }}>
                ✅ Đủ điều kiện thanh toán – 3-Way Match hoàn tất
              </div>
            )}
            {(!form.matchPO || !form.matchAcceptance) && (
              <div style={{ marginTop: 10, padding: "8px 14px", background: "#fff2f0", borderRadius: 8, color: "#ff4d4f", fontSize: 13 }}>
                ⚠️ Chưa đủ điều kiện – Cần hoàn tất 3-Way Match trước khi thanh toán
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Ghi chú</label>
            <textarea className="form-control" rows={2} value={form.note} onChange={(e) => set("note", e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...invoice, ...form })}>
            {isEdit ? "Lưu" : "Tạo hóa đơn"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorInvoiceList() {
  document.title = "Hóa đơn NCC – TNPM";

  const [invoices, setInvoices] = useState(MOCK_VENDOR_INVOICES);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const filtered = useMemo(() => invoices.filter((i) => {
    const q = search.toLowerCase();
    return (
      (!search || i.code.toLowerCase().includes(q) || i.vendorName.toLowerCase().includes(q)) &&
      (!filterStatus || i.approvalStatus === filterStatus)
    );
  }), [invoices, search, filterStatus]);

  const handleSave = (data: any) => {
    if (data.id) setInvoices((p) => p.map((i) => (i.id === data.id ? data : i)));
    else setInvoices((p) => [...p, { ...data, id: Date.now() }]);
    setShowModal(false); setEditing(null);
  };

  const totalApproved = filtered.filter(i => i.approvalStatus === "approved").reduce((a, i) => a + i.amount, 0);
  const totalPending = filtered.filter(i => i.approvalStatus === "pending").reduce((a, i) => a + i.amount, 0);

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🧾 Hóa đơn Nhà cung cấp</h1>
          <p className="page-sub">Vendor Invoice – 3-Way Match | Phê duyệt đa cấp | Thanh toán NCC</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Nhập hóa đơn NCC</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Tổng hóa đơn", value: invoices.length, color: "#1890ff" },
          { label: "Chờ duyệt", value: invoices.filter(i => i.approvalStatus === "pending").length, color: "#faad14" },
          { label: "Đã duyệt", value: fmtMoney(totalApproved), color: "#52c41a" },
          { label: "Chờ duyệt (giá trị)", value: fmtMoney(totalPending), color: "#fa8c16" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="🔍 Tìm mã HĐ, NCC..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
        <span className="result-count">{filtered.length} hóa đơn</span>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã HĐ NCC</th>
              <th>Nhà cung cấp</th>
              <th>Dự án</th>
              <th>Kỳ DV</th>
              <th>Số tiền</th>
              <th>Ngày nộp</th>
              <th>Match PO</th>
              <th>Match BN NT</th>
              <th>3-Way</th>
              <th>Duyệt</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={11} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có hóa đơn NCC</td></tr>
            )}
            {filtered.map((inv) => {
              const project = MOCK_PROJECTS.find(p => p.id === inv.projectId);
              const threeWay = inv.matchPO && inv.matchAcceptance;
              return (
                <tr key={inv.id}>
                  <td><span className="code-text">{inv.code}</span></td>
                  <td style={{ fontWeight: 500 }}>{inv.vendorName}</td>
                  <td style={{ fontSize: 12 }}>{project?.name || "—"}</td>
                  <td>{inv.period}</td>
                  <td className="amount-text">{fmtMoney(inv.amount)}</td>
                  <td style={{ fontSize: 12 }}>{inv.submittedAt}</td>
                  <td style={{ textAlign: "center" }}>{inv.matchPO ? "✅" : "❌"}</td>
                  <td style={{ textAlign: "center" }}>{inv.matchAcceptance ? "✅" : "❌"}</td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ fontWeight: 600, color: threeWay ? "#52c41a" : "#ff4d4f" }}>
                      {threeWay ? "✅ Đạt" : "❌ Chưa"}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: `${STATUS_COLORS[inv.approvalStatus]}22`, color: STATUS_COLORS[inv.approvalStatus] }}>
                      {STATUS_LABELS[inv.approvalStatus]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 5 }}>
                      {inv.approvalStatus === "pending" && threeWay && (
                        <button className="action-btn action-btn--view" title="Duyệt" style={{ background: "#f6ffed" }}
                          onClick={() => setInvoices(p => p.map(i => i.id === inv.id ? { ...i, approvalStatus: "approved", paidAt: new Date().toISOString().split("T")[0] } : i))}>
                          ✅
                        </button>
                      )}
                      <button className="action-btn action-btn--edit" onClick={() => { setEditing(inv); setShowModal(true); }}>✏️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && <AddVendorInvoiceModal invoice={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />}
    </div>
  );
}
