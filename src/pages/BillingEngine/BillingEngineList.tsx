import React, { useState, useMemo } from "react";
import {
  MOCK_INVOICES, MOCK_PROJECTS, MOCK_CUSTOMERS,
  STATUS_LABELS, STATUS_COLORS,
} from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

function AddInvoiceModal({ invoice, onSave, onClose }: any) {
  const isEdit = !!invoice?.id;
  const [form, setForm] = useState({
    code: "", contractId: "", customerId: "", projectId: "", period: "",
    dueDate: "", status: "pending", note: "",
    items: [{ name: "Phí thuê", amount: 0 }, { name: "Phí quản lý", amount: 0 }, { name: "Điện", amount: 0 }, { name: "Nước", amount: 0 }],
    ...invoice,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const setItem = (i: number, k: string, v: any) =>
    setForm((f) => { const items = [...f.items]; items[i] = { ...items[i], [k]: v }; return { ...f, items }; });
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { name: "", amount: 0 }] }));
  const removeItem = (i: number) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const total = form.items.reduce((a, it) => a + (+it.amount || 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Sửa hóa đơn" : "💳 Tạo hóa đơn mới"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Mã hóa đơn</label>
              <input className="form-control" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="HD-2024-001" />
            </div>
            <div className="form-group">
              <label>Kỳ thanh toán</label>
              <input className="form-control" value={form.period} onChange={(e) => set("period", e.target.value)} placeholder="2024-04 hoặc 2024-Q2" />
            </div>

            <div className="form-group">
              <label>Khách hàng</label>
              <select className="form-control" value={form.customerId} onChange={(e) => set("customerId", +e.target.value)}>
                <option value="">-- Chọn khách hàng --</option>
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
              <label>Hạn thanh toán</label>
              <input className="form-control" type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="pending">Chờ thanh toán</option>
                <option value="paid">Đã thanh toán</option>
                <option value="overdue">Quá hạn</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Line items */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontWeight: 600 }}>Chi tiết hóa đơn</span>
              <button type="button" className="btn btn-outline" style={{ padding: "4px 12px", fontSize: 12 }} onClick={addItem}>+ Thêm dòng</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", border: "1px solid #f0f0f0" }}>Khoản phí</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", border: "1px solid #f0f0f0" }}>Số tiền (đ)</th>
                  <th style={{ padding: "8px 10px", width: 40, border: "1px solid #f0f0f0" }}></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ padding: "6px 8px", border: "1px solid #f0f0f0" }}>
                      <input className="form-control" style={{ padding: "4px 8px" }} value={item.name} onChange={(e) => setItem(i, "name", e.target.value)} placeholder="Tên khoản phí" />
                    </td>
                    <td style={{ padding: "6px 8px", border: "1px solid #f0f0f0" }}>
                      <input className="form-control" type="number" min={0} style={{ padding: "4px 8px", textAlign: "right" }} value={item.amount} onChange={(e) => setItem(i, "amount", +e.target.value)} />
                    </td>
                    <td style={{ padding: "6px 8px", border: "1px solid #f0f0f0", textAlign: "center" }}>
                      <button type="button" onClick={() => removeItem(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ff4d4f" }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f0f7ff" }}>
                  <td style={{ padding: "10px", fontWeight: 700, border: "1px solid #d9e8ff" }}>TỔNG CỘNG</td>
                  <td style={{ padding: "10px", fontWeight: 700, textAlign: "right", border: "1px solid #d9e8ff", color: "#1890ff", fontSize: 15 }}>{fmtMoney(total)}</td>
                  <td style={{ border: "1px solid #d9e8ff" }}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="form-group form-group--full" style={{ marginTop: 16 }}>
            <label>Ghi chú</label>
            <textarea className="form-control" rows={2} value={form.note} onChange={(e) => set("note", e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...invoice, ...form, totalAmount: total, paidAmount: invoice?.paidAmount || 0 })}>
            {isEdit ? "Lưu thay đổi" : "Tạo hóa đơn"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ invoice, onClose, onPaid }: any) {
  const [method, setMethod] = useState("bank_transfer");
  const [txnRef, setTxnRef] = useState("");
  const fmtMoney2 = (n) => `${(n || 0).toLocaleString("vi-VN")} đ`;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--narrow" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">💰 Ghi nhận thanh toán</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ background: "#f0f7ff", borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#8c8c8c" }}>Số tiền cần thanh toán</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#1890ff" }}>
              {fmtMoney2(invoice.totalAmount - invoice.paidAmount)}
            </div>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>Hóa đơn: {invoice.code} | KH: {invoice.customerName}</div>
          </div>
          <div className="form-group">
            <label>Phương thức thanh toán</label>
            <select className="form-control" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="bank_transfer">Chuyển khoản ngân hàng</option>
              <option value="msb_pay">MSB Pay / QR Code</option>
              <option value="cash">Tiền mặt</option>
              <option value="timi_app">App Timi</option>
            </select>
          </div>
          <div className="form-group">
            <label>Mã giao dịch / Tham chiếu</label>
            <input className="form-control" value={txnRef} onChange={(e) => setTxnRef(e.target.value)} placeholder="VD: MSB20240401001" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-success" onClick={() => onPaid({ method, txnRef })}>✅ Xác nhận đã thanh toán</button>
        </div>
      </div>
    </div>
  );
}

export default function BillingEngineList() {
  document.title = "Hóa đơn & Billing – TNPM";

  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState<any>(null);
  const [payInvoice, setPayInvoice] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    let data = invoices;
    if (activeTab === "overdue") data = data.filter(i => i.status === "overdue");
    else if (activeTab === "pending") data = data.filter(i => i.status === "pending");
    else if (activeTab === "paid") data = data.filter(i => i.status === "paid");
    return data.filter((inv) => {
      const q = search.toLowerCase();
      return (
        (!search || inv.code.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q)) &&
        (!filterStatus || inv.status === filterStatus) &&
        (!filterProject || String(inv.projectId) === filterProject)
      );
    });
  }, [invoices, search, filterStatus, filterProject, activeTab]);

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((a, i) => a + i.paidAmount, 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((a, i) => a + (i.totalAmount - i.paidAmount), 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((a, i) => a + (i.totalAmount - i.paidAmount), 0);

  const handleSave = (data: any) => {
    if (data.id) setInvoices((p) => p.map((i) => (i.id === data.id ? data : i)));
    else setInvoices((p) => [...p, { ...data, id: Date.now() }]);
    setShowAddModal(false); setEditInvoice(null);
  };

  const handlePaid = (invId: number, payData: any) => {
    setInvoices((p) => p.map((i) => i.id === invId ? { ...i, status: "paid", paidAmount: i.totalAmount, paidAt: new Date().toISOString().split("T")[0] } : i));
    setPayInvoice(null);
  };

  const TABS = [
    { key: "all", label: `Tất cả (${invoices.length})` },
    { key: "pending", label: `Chờ TT (${invoices.filter(i => i.status === "pending").length})` },
    { key: "overdue", label: `Quá hạn (${invoices.filter(i => i.status === "overdue").length})` },
    { key: "paid", label: `Đã TT (${invoices.filter(i => i.status === "paid").length})` },
  ];

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">💳 Billing Engine – Hóa đơn</h1>
          <p className="page-sub">Quản lý hóa đơn phí thuê, phí dịch vụ và công nợ</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline">📊 Xuất Excel</button>
          <button className="btn btn-primary" onClick={() => { setEditInvoice(null); setShowAddModal(true); }}>+ Tạo hóa đơn</button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Đã thu tháng này", value: fmtMoney(totalPaid), color: "#52c41a", icon: "✅" },
          { label: "Chờ thanh toán", value: fmtMoney(totalPending), color: "#faad14", icon: "⏳" },
          { label: "Quá hạn", value: fmtMoney(totalOverdue), color: "#ff4d4f", icon: "⚠️" },
          { label: "Tổng hóa đơn", value: invoices.length, color: "#1890ff", icon: "📋" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #f0f0f0", marginBottom: 0, background: "#fff", borderRadius: "12px 12px 0 0", padding: "0 16px" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "12px 20px", border: "none", background: "transparent", cursor: "pointer",
              fontSize: 13, fontWeight: activeTab === t.key ? 600 : 400,
              color: activeTab === t.key ? "#1890ff" : "#8c8c8c",
              borderBottom: activeTab === t.key ? "2px solid #1890ff" : "2px solid transparent",
            }}
          >{t.label}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", padding: "8px 0" }}>
          <input className="search-input" style={{ width: 220 }} placeholder="🔍 Tìm hóa đơn, KH..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="filter-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
            <option value="">Tất cả dự án</option>
            {MOCK_PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã hóa đơn</th>
              <th>Khách hàng</th>
              <th>Dự án</th>
              <th>Kỳ</th>
              <th>Hạn TT</th>
              <th>Tổng tiền</th>
              <th>Đã TT</th>
              <th>Còn lại</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có hóa đơn nào</td></tr>
            )}
            {filtered.map((inv) => {
              const project = MOCK_PROJECTS.find((p) => p.id === inv.projectId);
              const remaining = inv.totalAmount - inv.paidAmount;
              return (
                <tr key={inv.id}>
                  <td><span className="code-text">{inv.code}</span></td>
                  <td style={{ fontWeight: 500, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.customerName}</td>
                  <td style={{ fontSize: 12, color: "#595959" }}>{project?.name || "—"}</td>
                  <td>{inv.period}</td>
                  <td style={{ fontSize: 12, color: inv.status === "overdue" ? "#ff4d4f" : "#1a1a2e" }}>{inv.dueDate}</td>
                  <td className="amount-text">{fmtMoney(inv.totalAmount)}</td>
                  <td className="amount-text" style={{ color: "#52c41a" }}>{fmtMoney(inv.paidAmount)}</td>
                  <td className="amount-text" style={{ color: remaining > 0 ? "#ff4d4f" : "#52c41a" }}>
                    {remaining > 0 ? fmtMoney(remaining) : "✅"}
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: `${STATUS_COLORS[inv.status]}22`, color: STATUS_COLORS[inv.status] }}>
                      {STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 5 }}>
                      {inv.status !== "paid" && (
                        <button className="action-btn action-btn--view" onClick={() => setPayInvoice(inv)} title="Ghi nhận TT" style={{ background: "#f6ffed" }}>💰</button>
                      )}
                      <button className="action-btn action-btn--edit" onClick={() => { setEditInvoice(inv); setShowAddModal(true); }} title="Sửa">✏️</button>
                      <button className="action-btn action-btn--delete" onClick={() => setDeleteId(inv.id)} title="Xóa">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && <AddInvoiceModal invoice={editInvoice} onSave={handleSave} onClose={() => { setShowAddModal(false); setEditInvoice(null); }} />}
      {payInvoice && <PaymentModal invoice={payInvoice} onClose={() => setPayInvoice(null)} onPaid={(data) => handlePaid(payInvoice.id, data)} />}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Xóa hóa đơn</h3>
            <p>Bạn có chắc muốn xóa hóa đơn này?</p>
            <div className="confirm-dialog__actions">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={() => { setInvoices(p => p.filter(i => i.id !== deleteId)); setDeleteId(null); }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
