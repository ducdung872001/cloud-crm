import React, { useState, useMemo } from "react";
import {
  MOCK_VENDORS, MOCK_VENDOR_CONTRACTS, MOCK_VENDOR_INVOICES,
  MOCK_SERVICE_REQUESTS, MOCK_MAINTENANCE_PLANS, MOCK_DEBTS,
  STATUS_LABELS, STATUS_COLORS,
} from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

// ─── Submit Invoice Modal (NCC upload invoice) ───────────────────────────
function SubmitInvoiceModal({ vendor, onClose, onSubmit }: any) {
  const [form, setForm] = useState({
    contractId: "", period: "", amount: 0, description: "",
    poRef: "", acceptanceRef: "",
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const myContracts = MOCK_VENDOR_CONTRACTS.filter((c: any) => c.vendorId === vendor.id && c.status === "active");

  const handleSubmit = () => {
    if (!form.contractId) return alert("Vui lòng chọn hợp đồng");
    if (!form.period) return alert("Vui lòng chọn kỳ");
    if (form.amount <= 0) return alert("Số tiền phải > 0");
    if (!form.poRef) return alert("Vui lòng nhập PO ref");
    if (!form.acceptanceRef) return alert("Vui lòng nhập BB nghiệm thu ref");
    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <h2 className="modal-title">📤 Gửi hóa đơn tới TNPM</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ background: "#e6f7ff", padding: 12, borderRadius: 6, marginBottom: 14, fontSize: 12 }}>
            ℹ️ Hóa đơn sẽ được kiểm tra theo luồng <strong>3-way match</strong>: PO → Biên bản nghiệm thu → Invoice. Sau khi submit, kế toán TNPM sẽ review và phê duyệt thanh toán.
          </div>

          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Hợp đồng *</label>
              <select className="form-control" value={form.contractId} onChange={(e) => set("contractId", e.target.value)}>
                <option value="">-- Chọn hợp đồng --</option>
                {myContracts.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.projectName} — {c.serviceType} — {fmtMoney(c.value)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Kỳ *</label>
              <input className="form-control" value={form.period} onChange={(e) => set("period", e.target.value)} placeholder="2024-04" />
            </div>
            <div className="form-group">
              <label>Số tiền *</label>
              <input className="form-control" type="number" value={form.amount} onChange={(e) => set("amount", +e.target.value)} />
              <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>{fmtMoney(form.amount)}</div>
            </div>
            <div className="form-group">
              <label>PO Reference *</label>
              <input className="form-control" value={form.poRef} onChange={(e) => set("poRef", e.target.value)} placeholder="PO-2024-XXX" />
            </div>
            <div className="form-group">
              <label>Biên bản nghiệm thu *</label>
              <input className="form-control" value={form.acceptanceRef} onChange={(e) => set("acceptanceRef", e.target.value)} placeholder="BB-2024-XXX" />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Mô tả / Ghi chú</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Nội dung công việc đã thực hiện..." />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Đính kèm file hóa đơn</label>
              <div style={{ padding: 20, border: "2px dashed #d9d9d9", borderRadius: 8, textAlign: "center", color: "#8c8c8c" }}>
                📎 Kéo thả hoặc click để upload PDF hóa đơn (prototype — upload chưa hoạt động)
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSubmit}>📤 Gửi hóa đơn</button>
        </div>
      </div>
    </div>
  );
}

// ─── SR Detail Modal (vendor view) ───────────────────────────────────────
function SRDetailModal({ sr, onClose, onUpdate }: any) {
  const [newStatus, setNewStatus] = useState(sr.status);
  const [progressNote, setProgressNote] = useState("");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🔧 {sr.code} — {sr.title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{sr.projectName} — Unit {sr.unitCode}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>Khách: {sr.customerName}</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>{sr.description}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "#8c8c8c" }}>Tạo lúc</div>
              <div style={{ fontSize: 13 }}>{sr.createdAt}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#8c8c8c" }}>Hạn xử lý</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#ff4d4f" }}>{sr.dueAt}</div>
            </div>
          </div>

          <div className="form-group">
            <label>Cập nhật trạng thái</label>
            <select className="form-control" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="pending">Chờ xử lý</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="resolved">Đã hoàn thành</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ghi chú tiến độ</label>
            <textarea className="form-control" rows={3} value={progressNote} onChange={(e) => setProgressNote(e.target.value)} placeholder="Mô tả công việc đã làm, vật tư sử dụng, hình ảnh..." />
          </div>

          <div style={{ padding: 12, background: "#fffbe6", borderRadius: 6, fontSize: 12 }}>
            💡 Sau khi đánh dấu "Đã hoàn thành", BQL sẽ nghiệm thu và tạo Biên bản. Bạn có thể gửi hóa đơn sau khi có BB.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => { onUpdate(sr.id, newStatus, progressNote); onClose(); }}>💾 Lưu cập nhật</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Portal ─────────────────────────────────────────────────────────
export default function VendorPortalPreview() {
  document.title = "Vendor Portal Preview – TNPM";

  // Default to KT Việt (vendor id 1) as demo
  const [selectedVendorId, setSelectedVendorId] = useState(1);
  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks" | "contracts" | "invoices" | "payments">("dashboard");
  const [showSubmitInvoice, setShowSubmitInvoice] = useState(false);
  const [srDetail, setSrDetail] = useState<any>(null);
  const [srs, setSrs] = useState<any[]>(MOCK_SERVICE_REQUESTS);
  const [invoices, setInvoices] = useState<any[]>(MOCK_VENDOR_INVOICES);

  const vendor = MOCK_VENDORS.find((v: any) => v.id === selectedVendorId);
  if (!vendor) return <div>Vendor not found</div>;

  const myContracts = MOCK_VENDOR_CONTRACTS.filter((c: any) => c.vendorId === selectedVendorId);
  const myInvoices = invoices.filter((i: any) => i.vendorId === selectedVendorId);
  const mySRs = srs.filter((sr: any) => sr.assignedVendorId === selectedVendorId);
  const myMaintPlans = MOCK_MAINTENANCE_PLANS.filter((mp: any) => mp.vendorId === selectedVendorId);
  const myDebts = MOCK_DEBTS.filter((d: any) => d.kind === "payable" && d.counterpartyType === "vendor" && d.counterpartyId === selectedVendorId);

  const activeContracts = myContracts.filter((c: any) => c.status === "active").length;
  const activeContractValue = myContracts.filter((c: any) => c.status === "active").reduce((a: number, c: any) => a + (c.value || 0), 0);
  const openSRs = mySRs.filter((sr: any) => sr.status !== "resolved" && sr.status !== "closed").length;
  const pendingInvoices = myInvoices.filter((i: any) => i.approvalStatus === "pending").length;
  const totalReceivable = myDebts.reduce((a: number, d: any) => a + d.amount, 0);

  const updateSR = (id: number, status: string, note: string) => {
    setSrs((prev: any) => prev.map((sr: any) => sr.id === id ? { ...sr, status, progressNote: note, completedAt: status === "resolved" ? new Date().toISOString().replace("T", " ").slice(0, 16) : sr.completedAt } : sr));
    alert(`✓ Đã cập nhật SR. ${status === "resolved" ? "BQL sẽ nghiệm thu sớm." : ""}`);
  };

  const submitInvoice = (data: any) => {
    const contract = MOCK_VENDOR_CONTRACTS.find((c: any) => c.id === +data.contractId);
    const newInv = {
      id: Date.now(),
      code: `NVAT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      vendorId: vendor.id,
      vendorName: vendor.shortName,
      vendorContractId: +data.contractId,
      projectId: contract?.projectId,
      amount: data.amount,
      period: data.period,
      submittedAt: new Date().toISOString().split("T")[0],
      approvalStatus: "pending",
      paidAt: null,
      matchPO: true,
      matchAcceptance: true,
      poRef: data.poRef,
      acceptanceRef: data.acceptanceRef,
    };
    setInvoices((prev: any) => [newInv, ...prev]);
    setShowSubmitInvoice(false);
    alert(`✓ Đã gửi hóa đơn ${newInv.code} tới TNPM. Kế toán sẽ review trong 1-2 ngày làm việc.`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Banner notice — this is a preview */}
      <div style={{ padding: "10px 20px", background: "#fff1f0", borderBottom: "1px solid #ffccc7", fontSize: 12, textAlign: "center" }}>
        🔶 <strong>PREVIEW MODE</strong> — Đây là trang xem trước "Cổng nhà cung cấp" từ góc nhìn NCC. Thực tế sẽ chạy trên domain riêng <code>vendor.tnpm.vn</code> với auth login riêng cho NCC.
        <select style={{ marginLeft: 14, padding: "3px 8px", fontSize: 12 }} value={selectedVendorId} onChange={(e) => setSelectedVendorId(+e.target.value)}>
          {MOCK_VENDORS.map((v: any) => <option key={v.id} value={v.id}>👤 Đăng nhập với: {v.name}</option>)}
        </select>
      </div>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)", color: "#fff", padding: "20px 30px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>TNPM Vendor Portal</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>🏭 {vendor.name}</div>
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>{vendor.code} · Rating: {vendor.rating} ⭐ · {activeContracts} HĐ đang có hiệu lực</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-outline" style={{ background: "#fff", border: "none" }}>💬 Liên hệ TNPM</button>
            <button className="btn btn-primary" style={{ background: "#fff", color: "#1890ff", border: "none" }} onClick={() => setShowSubmitInvoice(true)}>
              + Gửi hóa đơn mới
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { label: "HĐ đang có hiệu lực", value: `${activeContracts}`, sub: fmtMoney(activeContractValue), color: "#1890ff", icon: "📄" },
            { label: "Task đang mở", value: `${openSRs}`, sub: `${mySRs.length} tổng cộng`, color: "#faad14", icon: "🔧" },
            { label: "HĐ chờ duyệt", value: `${pendingInvoices}`, sub: "Đang review", color: "#722ed1", icon: "⏳" },
            { label: "TNPM nợ bạn", value: fmtMoney(totalReceivable), sub: totalReceivable > 0 ? `${myDebts.length} khoản` : "Đã TT hết", color: totalReceivable > 0 ? "#52c41a" : "#8c8c8c", icon: "💰" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#1a1a2e", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #f0f0f0", background: "#fff", borderRadius: "12px 12px 0 0", padding: "0 16px" }}>
          {[
            { key: "dashboard", label: "🏠 Tổng quan" },
            { key: "tasks", label: `🔧 Công việc (${mySRs.length})` },
            { key: "contracts", label: `📄 HĐ (${myContracts.length})` },
            { key: "invoices", label: `💳 HĐ đã gửi (${myInvoices.length})` },
            { key: "payments", label: `💰 Thanh toán` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              style={{
                padding: "14px 22px", border: "none", background: "transparent", cursor: "pointer",
                fontSize: 14, fontWeight: activeTab === t.key ? 600 : 400,
                color: activeTab === t.key ? "#1890ff" : "#8c8c8c",
                borderBottom: activeTab === t.key ? "2px solid #1890ff" : "2px solid transparent",
              }}
            >{t.label}</button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)", minHeight: 400 }}>
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>📢 Công việc cần xử lý</div>
              {mySRs.filter((sr: any) => sr.status === "pending" || sr.status === "in_progress").slice(0, 3).map((sr: any) => (
                <div key={sr.id} style={{ padding: 14, borderLeft: "4px solid #faad14", background: "#fffbe6", borderRadius: 6, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{sr.code} — {sr.title}</div>
                      <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 2 }}>{sr.projectName} · {sr.unitCode}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "#ff4d4f" }}>Hạn: {sr.dueAt}</div>
                      <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: 11, marginTop: 4 }} onClick={() => setSrDetail(sr)}>Cập nhật tiến độ</button>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ fontWeight: 600, marginBottom: 12, marginTop: 20 }}>📅 Kế hoạch bảo trì sắp tới</div>
              {myMaintPlans.slice(0, 3).map((mp: any) => (
                <div key={mp.id} style={{ padding: 12, background: "#f5f7fa", borderRadius: 6, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{mp.title}</div>
                    <div style={{ fontSize: 11, color: "#8c8c8c" }}>{mp.projectName} · {mp.plannedDate}</div>
                  </div>
                  <div style={{ fontWeight: 600, color: "#1890ff" }}>{fmtMoney(mp.estimatedCost)}</div>
                </div>
              ))}
            </div>
          )}

          {/* TASKS */}
          {activeTab === "tasks" && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã SR</th>
                  <th>Tiêu đề</th>
                  <th>Dự án / Unit</th>
                  <th>Loại</th>
                  <th>Ưu tiên</th>
                  <th>Hạn</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {mySRs.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 30, color: "#8c8c8c" }}>Chưa có task nào được phân công.</td></tr>
                )}
                {mySRs.map((sr: any) => (
                  <tr key={sr.id}>
                    <td><span className="code-text">{sr.code}</span></td>
                    <td style={{ maxWidth: 220 }}>{sr.title}</td>
                    <td style={{ fontSize: 12 }}>{sr.projectName}<br /><span style={{ color: "#8c8c8c" }}>{sr.unitCode}</span></td>
                    <td style={{ fontSize: 12 }}>{sr.category}</td>
                    <td>
                      <span className="status-badge" style={{
                        background: sr.priority === "urgent" ? "#fff1f0" : sr.priority === "high" ? "#fff7e6" : "#f5f5f5",
                        color: sr.priority === "urgent" ? "#ff4d4f" : sr.priority === "high" ? "#fa8c16" : "#8c8c8c",
                      }}>
                        {sr.priority === "urgent" ? "Khẩn" : sr.priority === "high" ? "Cao" : sr.priority === "medium" ? "TB" : "Thấp"}
                      </span>
                    </td>
                    <td style={{ fontSize: 11 }}>{sr.dueAt}</td>
                    <td>
                      <span className="status-badge" style={{ background: `${STATUS_COLORS[sr.status]}22`, color: STATUS_COLORS[sr.status] }}>
                        {STATUS_LABELS[sr.status]}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setSrDetail(sr)}>Cập nhật</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* CONTRACTS */}
          {activeTab === "contracts" && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dự án</th>
                  <th>Loại dịch vụ</th>
                  <th>Giá trị HĐ</th>
                  <th>SLA</th>
                  <th>Hiệu lực</th>
                  <th>Điều khoản TT</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {myContracts.map((c: any) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.projectName}</td>
                    <td>{c.serviceType}</td>
                    <td className="amount-text">{fmtMoney(c.value)}</td>
                    <td>{c.slaDays === 0 ? "24/7" : `${c.slaDays} ngày`}</td>
                    <td style={{ fontSize: 12 }}>{c.startDate} → {c.endDate}</td>
                    <td style={{ fontSize: 12 }}>{c.paymentTerms === "monthly" ? "Hàng tháng" : c.paymentTerms === "quarterly" ? "Hàng quý" : c.paymentTerms}</td>
                    <td>
                      <span className="status-badge" style={{ background: `${STATUS_COLORS[c.status]}22`, color: STATUS_COLORS[c.status] }}>
                        {STATUS_LABELS[c.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* INVOICES */}
          {activeTab === "invoices" && (
            <div>
              <div style={{ marginBottom: 14, padding: 12, background: "#e6f7ff", borderRadius: 6, fontSize: 12 }}>
                ℹ️ Click <strong>+ Gửi hóa đơn mới</strong> ở trên để submit hóa đơn mới cho TNPM.
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã HĐ</th>
                    <th>Kỳ</th>
                    <th>Số tiền</th>
                    <th>Ngày gửi</th>
                    <th>3-way match</th>
                    <th>Trạng thái duyệt</th>
                    <th>Ngày TT</th>
                  </tr>
                </thead>
                <tbody>
                  {myInvoices.map((i: any) => (
                    <tr key={i.id}>
                      <td><span className="code-text">{i.code}</span></td>
                      <td>{i.period}</td>
                      <td className="amount-text">{fmtMoney(i.amount)}</td>
                      <td style={{ fontSize: 12 }}>{i.submittedAt}</td>
                      <td style={{ textAlign: "center" }}>
                        {i.matchPO && i.matchAcceptance ? <span style={{ color: "#52c41a" }}>✅ Đạt</span> : <span style={{ color: "#faad14" }}>⏳ Đang KT</span>}
                      </td>
                      <td>
                        <span className="status-badge" style={{
                          background: i.approvalStatus === "approved" ? "#f6ffed" : i.approvalStatus === "pending" ? "#fff7e6" : "#fff1f0",
                          color: i.approvalStatus === "approved" ? "#52c41a" : i.approvalStatus === "pending" ? "#faad14" : "#ff4d4f",
                        }}>
                          {i.approvalStatus === "approved" ? "Đã duyệt" : i.approvalStatus === "pending" ? "Chờ duyệt" : "Từ chối"}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: i.paidAt ? "#52c41a" : "#8c8c8c" }}>{i.paidAt || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAYMENTS */}
          {activeTab === "payments" && (
            <div>
              <div style={{ marginBottom: 14, padding: 12, background: totalReceivable > 0 ? "#fff7e6" : "#f6ffed", borderRadius: 6, fontSize: 13 }}>
                {totalReceivable > 0 ? (
                  <>💰 TNPM hiện <strong>đang nợ bạn {fmtMoney(totalReceivable)}</strong> ({myDebts.length} khoản). Dự kiến thanh toán theo điều khoản HĐ.</>
                ) : (
                  <>✅ Không có khoản nào TNPM còn nợ bạn.</>
                )}
              </div>
              {myDebts.length > 0 && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tham chiếu</th>
                      <th>Dự án</th>
                      <th>Số tiền</th>
                      <th>Hạn TT</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myDebts.map((d: any) => (
                      <tr key={d.id}>
                        <td><span className="code-text">{d.refCode}</span></td>
                        <td style={{ fontSize: 12 }}>{d.projectName}</td>
                        <td className="amount-text" style={{ color: "#ff4d4f", fontWeight: 600 }}>{fmtMoney(d.amount)}</td>
                        <td style={{ fontSize: 12 }}>{d.dueDate}</td>
                        <td>
                          <span className="status-badge" style={{
                            background: d.status === "overdue" ? "#fff1f0" : "#fff7e6",
                            color: d.status === "overdue" ? "#ff4d4f" : "#faad14",
                          }}>
                            {d.status === "overdue" ? `Quá hạn ${Math.abs(d.daysRemaining)}d` : d.status === "upcoming" ? `Còn ${d.daysRemaining}d` : "Đang xử lý"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {showSubmitInvoice && <SubmitInvoiceModal vendor={vendor} onClose={() => setShowSubmitInvoice(false)} onSubmit={submitInvoice} />}
      {srDetail && <SRDetailModal sr={srDetail} onClose={() => setSrDetail(null)} onUpdate={updateSR} />}
    </div>
  );
}
