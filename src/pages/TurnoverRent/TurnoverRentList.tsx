import React, { useState, useMemo } from "react";
import {
  MOCK_TURNOVER_REPORTS, MOCK_CUSTOMERS, MOCK_LEASE_CONTRACTS,
  STATUS_LABELS, STATUS_COLORS,
} from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

function AddTurnoverModal({ report, onSave, onClose }: any) {
  const isEdit = !!report?.id;
  const retailContracts = MOCK_LEASE_CONTRACTS.filter(c => c.contractType === "retail" && c.turnoverRentRate);
  const [form, setForm] = useState({
    contractId: "", customerId: "", customerName: "", unitCode: "",
    period: "", reportedRevenue: 0, turnoverRentRate: 8, status: "pending", note: "",
    ...report,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const calculatedFee = Math.round((+form.reportedRevenue || 0) * ((+form.turnoverRentRate || 0) / 100));

  const handleContractChange = (contractId: string) => {
    const contract = retailContracts.find(c => String(c.id) === contractId);
    if (contract) {
      set("contractId", contractId);
      set("customerName", contract.customerName);
      set("unitCode", contract.unitCode);
      set("turnoverRentRate", contract.turnoverRentRate || 8);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Sửa báo cáo" : "📊 Nhập báo cáo doanh thu"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Hợp đồng thuê TTTM <span className="required">*</span></label>
              <select className="form-control" value={form.contractId} onChange={(e) => handleContractChange(e.target.value)}>
                <option value="">-- Chọn hợp đồng --</option>
                {retailContracts.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} – {c.customerName} – {c.unitCode}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Kỳ báo cáo (YYYY-MM)</label>
              <input className="form-control" value={form.period} onChange={(e) => set("period", e.target.value)} placeholder="2024-03" />
            </div>

            <div className="form-group">
              <label>Khách hàng (tenant)</label>
              <input className="form-control" value={form.customerName} disabled />
            </div>
            <div className="form-group">
              <label>Mã unit</label>
              <input className="form-control" value={form.unitCode} disabled />
            </div>

            <div className="form-group">
              <label>Doanh thu khai báo (đ)</label>
              <input className="form-control" type="number" min={0} value={form.reportedRevenue} onChange={(e) => set("reportedRevenue", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tỷ lệ phí (%)</label>
              <input className="form-control" type="number" min={0} max={100} step={0.1} value={form.turnoverRentRate} onChange={(e) => set("turnoverRentRate", +e.target.value)} />
            </div>
          </div>

          {/* Auto-calculated fee */}
          <div style={{ background: "#f0f7ff", borderRadius: 10, padding: 16, marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "#8c8c8c" }}>Phí Turnover Rent tính được</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1890ff" }}>{fmtMoney(calculatedFee)}</div>
              <div style={{ fontSize: 11, color: "#8c8c8c" }}>= {fmtMoney(form.reportedRevenue)} × {form.turnoverRentRate}%</div>
            </div>
            <div style={{ fontSize: 36 }}>🧮</div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Trạng thái</label>
            <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="pending">Chờ nộp</option>
              <option value="submitted">Đã nộp</option>
              <option value="approved">Đã xác nhận</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
          <div className="form-group">
            <label>Ghi chú / Tài liệu đính kèm</label>
            <textarea className="form-control" rows={2} value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="Ghi chú hoặc đường dẫn tài liệu..." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...report, ...form, calculatedFee })}>
            {isEdit ? "Lưu" : "Tạo báo cáo"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TurnoverRentList() {
  document.title = "Turnover Rent – TNPM TTTM";

  const [reports, setReports] = useState(MOCK_TURNOVER_REPORTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const filtered = useMemo(() => reports.filter((r) => {
    const q = search.toLowerCase();
    return (
      (!search || r.customerName.toLowerCase().includes(q) || r.unitCode.toLowerCase().includes(q) || r.period.includes(q)) &&
      (!filterStatus || r.status === filterStatus)
    );
  }), [reports, search, filterStatus]);

  const handleSave = (data: any) => {
    if (data.id) setReports((p) => p.map((r) => (r.id === data.id ? data : r)));
    else setReports((p) => [...p, { ...data, id: Date.now() }]);
    setShowModal(false); setEditing(null);
  };

  const totalFees = filtered.filter(r => r.status !== "rejected").reduce((a, r) => a + (r.calculatedFee || 0), 0);

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Turnover Rent – Phí Doanh thu</h1>
          <p className="page-sub">Quản lý phí thuê theo % doanh thu cho Trung tâm thương mại</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Nhập báo cáo</button>
      </div>

      {/* Info card */}
      <div style={{ background: "linear-gradient(135deg, #722ed1, #2f54eb)", borderRadius: 12, padding: "20px 24px", marginBottom: 20, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>💡 Turnover Rent (TTTM)</div>
          <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
            Tenant tự submit doanh thu hàng tháng → Hệ thống tính phí theo tỷ lệ % trong HĐ → Tạo hóa đơn.
            <br />Hỗ trợ cross-check với báo cáo thuế và tích hợp POS (coming soon).
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Tổng phí kỳ này</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{fmtMoney(totalFees)}</div>
        </div>
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="🔍 Tìm tenant, unit, kỳ..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ nộp</option>
          <option value="submitted">Đã nộp</option>
          <option value="approved">Đã xác nhận</option>
          <option value="rejected">Từ chối</option>
        </select>
        <span className="result-count">{filtered.length} báo cáo</span>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tenant (Khách hàng)</th>
              <th>Unit</th>
              <th>Kỳ báo cáo</th>
              <th>Doanh thu khai báo</th>
              <th>Tỷ lệ (%)</th>
              <th>Phí tính được</th>
              <th>Ngày nộp</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có báo cáo nào</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 500 }}>{r.customerName}</td>
                <td><span className="code-text">{r.unitCode}</span></td>
                <td>{r.period}</td>
                <td className="amount-text">{fmtMoney(r.reportedRevenue)}</td>
                <td style={{ textAlign: "center" }}>{MOCK_LEASE_CONTRACTS.find(c => c.id === r.contractId)?.turnoverRentRate || 8}%</td>
                <td className="amount-text" style={{ color: "#722ed1" }}>{fmtMoney(r.calculatedFee)}</td>
                <td style={{ fontSize: 12 }}>{r.submittedAt || "—"}</td>
                <td>
                  <span className="status-badge" style={{ background: `${STATUS_COLORS[r.status]}22`, color: STATUS_COLORS[r.status] }}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    {r.status === "submitted" && (
                      <button className="action-btn action-btn--view" title="Xác nhận" onClick={() => setReports(p => p.map(x => x.id === r.id ? { ...x, status: "approved", verifiedAt: new Date().toISOString().split("T")[0] } : x))}>✅</button>
                    )}
                    <button className="action-btn action-btn--edit" onClick={() => { setEditing(r); setShowModal(true); }}>✏️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <AddTurnoverModal report={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />}
    </div>
  );
}
