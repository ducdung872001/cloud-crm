import React, { useState, useMemo } from "react";
import {
  MOCK_VENDOR_INVOICES, MOCK_VENDORS, MOCK_VENDOR_CONTRACTS, MOCK_PROJECTS,
  MOCK_SERVICE_REQUESTS,
  STATUS_LABELS, STATUS_COLORS,
} from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

// ─── 3-Way Match Detail Modal ────────────────────────────────────────────
// Hiển thị đầy đủ PO → Biên bản nghiệm thu → Invoice + workflow phê duyệt
function ThreeWayMatchModal({ invoice, onClose, onAdvanceStep }: any) {
  const contract = MOCK_VENDOR_CONTRACTS.find((c: any) => c.id === invoice.vendorContractId);
  const project = MOCK_PROJECTS.find((p: any) => p.id === invoice.projectId);
  const relatedSRs = MOCK_SERVICE_REQUESTS.filter((sr: any) =>
    sr.assignedVendorId === invoice.vendorId && sr.projectId === invoice.projectId && (sr.status === "resolved" || sr.status === "closed")
  ).slice(0, 3);

  // Derive or default workflow steps
  const workflow = invoice.workflow || [
    { step: 1, role: "Kỹ thuật hiện trường", assignee: "Nguyễn Kỹ Thuật", status: invoice.matchAcceptance ? "approved" : "pending", actionAt: invoice.matchAcceptance ? invoice.submittedAt : null, note: "Nghiệm thu hiện trường, ký BB" },
    { step: 2, role: "Kế toán trưởng", assignee: "Phạm Kế Toán", status: invoice.matchPO && invoice.matchAcceptance ? (invoice.approvalStatus === "approved" ? "approved" : "pending") : "pending", actionAt: null, note: "Kiểm tra 3-way match, đối chiếu số tiền" },
    { step: 3, role: "Quản lý dự án (QLDA)", assignee: "Trần QLDA", status: invoice.approvalStatus === "approved" ? "approved" : "pending", actionAt: null, note: "Phê duyệt cuối, ký chuyển chi" },
    { step: 4, role: "Chi thanh toán", assignee: "Hệ thống / Ngân hàng", status: invoice.paidAt ? "paid" : "pending", actionAt: invoice.paidAt, note: invoice.paidAt ? "Đã chuyển khoản NCC" : "Chờ chi" },
  ];

  const threeWayOk = invoice.matchPO && invoice.matchAcceptance;
  const nextStep = workflow.find((w: any) => w.status === "pending");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 960, maxHeight: "92vh" }}>
        <div className="modal-header">
          <h2 className="modal-title">🧾 {invoice.code} — 3-Way Match & Phê duyệt</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "calc(92vh - 130px)", overflowY: "auto" }}>
          {/* Header — vendor & basic info */}
          <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8, marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#8c8c8c" }}>Nhà cung cấp</div>
                <div style={{ fontWeight: 600 }}>{invoice.vendorName}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8c8c8c" }}>Dự án</div>
                <div style={{ fontWeight: 500 }}>{project?.name || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8c8c8c" }}>Số tiền</div>
                <div style={{ fontWeight: 700, color: "#ff4d4f", fontSize: 18 }}>{fmtMoney(invoice.amount)}</div>
              </div>
            </div>
          </div>

          {/* 3-way match comparison */}
          <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 15 }}>🔗 3-Way Match (PO → Biên bản nghiệm thu → Invoice)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            {/* Document 1: PO */}
            <div style={{ background: "#fff", border: "1.5px solid #1890ff", borderRadius: 10, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>📋</span>
                <div>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>Doc 1</div>
                  <div style={{ fontWeight: 700, color: "#1890ff" }}>Purchase Order</div>
                </div>
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>Mã PO:</strong> PO-{invoice.code.replace("NVAT-", "")}</div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>HĐ NCC:</strong> {contract?.id ? `#${contract.id}` : "—"}</div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>Loại DV:</strong> {contract?.serviceType || "—"}</div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>Giá trị HĐ:</strong> {fmtMoney(contract?.value || 0)}</div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>SLA:</strong> {contract?.slaDays} ngày</div>
              <div style={{ marginTop: 10, padding: 6, background: invoice.matchPO ? "#f6ffed" : "#fff1f0", borderRadius: 4, textAlign: "center", fontSize: 12, fontWeight: 600, color: invoice.matchPO ? "#52c41a" : "#ff4d4f" }}>
                {invoice.matchPO ? "✅ Match với HĐ NCC" : "❌ Chưa khớp HĐ"}
              </div>
            </div>

            {/* Document 2: Acceptance */}
            <div style={{ background: "#fff", border: "1.5px solid #722ed1", borderRadius: 10, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>📝</span>
                <div>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>Doc 2</div>
                  <div style={{ fontWeight: 700, color: "#722ed1" }}>Biên bản nghiệm thu</div>
                </div>
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>Mã BB:</strong> BB-{invoice.code.replace("NVAT-", "")}</div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>Ngày nghiệm thu:</strong> {invoice.submittedAt}</div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>Bên ký:</strong> KTV TNPM + NCC</div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>SR liên quan:</strong> {relatedSRs.length}</div>
              {relatedSRs.length > 0 && (
                <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 4 }}>
                  {relatedSRs.map((sr: any) => sr.code).join(", ")}
                </div>
              )}
              <div style={{ marginTop: 10, padding: 6, background: invoice.matchAcceptance ? "#f6ffed" : "#fff1f0", borderRadius: 4, textAlign: "center", fontSize: 12, fontWeight: 600, color: invoice.matchAcceptance ? "#52c41a" : "#ff4d4f" }}>
                {invoice.matchAcceptance ? "✅ BB đã ký + hợp lệ" : "❌ Chưa có BB hợp lệ"}
              </div>
            </div>

            {/* Document 3: Invoice */}
            <div style={{ background: "#fff", border: "1.5px solid #52c41a", borderRadius: 10, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>💳</span>
                <div>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>Doc 3</div>
                  <div style={{ fontWeight: 700, color: "#52c41a" }}>Invoice (Hóa đơn)</div>
                </div>
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>Mã:</strong> {invoice.code}</div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>Kỳ DV:</strong> {invoice.period}</div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>Số tiền:</strong> {fmtMoney(invoice.amount)}</div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>Ngày nộp:</strong> {invoice.submittedAt}</div>
              <div style={{ fontSize: 12, marginBottom: 4 }}><strong>Chênh lệch:</strong> <span style={{ color: "#52c41a" }}>0đ</span></div>
              <div style={{ marginTop: 10, padding: 6, background: threeWayOk ? "#f6ffed" : "#fff7e6", borderRadius: 4, textAlign: "center", fontSize: 12, fontWeight: 600, color: threeWayOk ? "#52c41a" : "#faad14" }}>
                {threeWayOk ? "✅ Đủ điều kiện chi" : "⏳ Chờ đủ 3-way"}
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div style={{
            padding: 14, borderRadius: 8, marginBottom: 16,
            background: threeWayOk ? "#f6ffed" : "#fff7e6",
            borderLeft: `4px solid ${threeWayOk ? "#52c41a" : "#faad14"}`,
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: threeWayOk ? "#52c41a" : "#faad14" }}>
              {threeWayOk ? "✅ 3-WAY MATCH OK — Đủ điều kiện xử lý phê duyệt thanh toán" : "⚠️ 3-WAY MATCH CHƯA ĐỦ — Cần hoàn thiện chứng từ"}
            </div>
            <div style={{ fontSize: 12, color: "#595959", marginTop: 4 }}>
              {threeWayOk
                ? "Các số liệu giữa PO, Biên bản nghiệm thu và Invoice đã khớp. Hóa đơn tiếp tục qua workflow phê duyệt đa cấp."
                : "Phải có cả Match PO + Match Acceptance trước khi kế toán có thể phê duyệt hóa đơn."}
            </div>
          </div>

          {/* Approval workflow */}
          <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 15 }}>⚙️ Luồng phê duyệt đa cấp</div>
          <div style={{ background: "#fafafa", padding: 14, borderRadius: 8 }}>
            {workflow.map((step: any, idx: number) => {
              const isApproved = step.status === "approved" || step.status === "paid";
              const isCurrent = step.status === "pending" && workflow.slice(0, idx).every((w: any) => w.status !== "pending");

              return (
                <div key={step.step} style={{ display: "flex", marginBottom: idx < workflow.length - 1 ? 14 : 0, gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: isApproved ? "#52c41a" : isCurrent ? "#faad14" : "#e8e8e8",
                      color: isApproved || isCurrent ? "#fff" : "#8c8c8c",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 14,
                      border: isCurrent ? "2px solid #fa8c16" : "none",
                    }}>
                      {isApproved ? "✓" : step.step}
                    </div>
                    {idx < workflow.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: isApproved ? "#52c41a" : "#e8e8e8", marginTop: 4, minHeight: 30 }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{step.role}</div>
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>{step.assignee}</div>
                      </div>
                      <span className="status-badge" style={{
                        background: isApproved ? "#f6ffed" : isCurrent ? "#fff7e6" : "#f5f5f5",
                        color: isApproved ? "#52c41a" : isCurrent ? "#faad14" : "#8c8c8c",
                      }}>
                        {step.status === "paid" ? "Đã chi" : step.status === "approved" ? "Đã duyệt" : isCurrent ? "ĐANG XỬ LÝ" : "Chờ"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#595959", marginTop: 4 }}>{step.note}</div>
                    {step.actionAt && <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>📅 {step.actionAt}</div>}

                    {isCurrent && threeWayOk && (
                      <div style={{ marginTop: 8 }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "6px 16px", fontSize: 12, background: "#52c41a" }}
                          onClick={() => onAdvanceStep(invoice.id, step.step, true)}
                        >
                          ✓ Phê duyệt bước này
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "6px 16px", fontSize: 12, marginLeft: 8, color: "#ff4d4f", borderColor: "#ff4d4f" }}
                          onClick={() => onAdvanceStep(invoice.id, step.step, false)}
                        >
                          ✗ Từ chối
                        </button>
                      </div>
                    )}

                    {isCurrent && !threeWayOk && (
                      <div style={{ marginTop: 8, padding: 8, background: "#fff1f0", borderRadius: 4, fontSize: 11, color: "#ff4d4f" }}>
                        ⚠ Không thể phê duyệt — cần hoàn thiện 3-way match trước.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 14, padding: 12, background: "#e6f7ff", borderRadius: 6, fontSize: 12 }}>
            💡 <strong>Chính sách phê duyệt</strong>: Bắt buộc 3-way match trước khi kế toán check. Sau khi đủ chữ ký 4 bước, hệ thống tự động chuyển lệnh chi qua MSB Pay. Digital signature yêu cầu cho tất cả bước ≥ bước 3.
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const [invoices, setInvoices] = useState<any[]>(MOCK_VENDOR_INVOICES);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [threeWayTarget, setThreeWayTarget] = useState<any>(null);

  const handleAdvanceStep = (invoiceId: number, step: number, approved: boolean) => {
    setInvoices((prev: any) => prev.map((inv: any) => {
      if (inv.id !== invoiceId) return inv;
      const currentWorkflow = inv.workflow || [
        { step: 1, role: "Kỹ thuật hiện trường", assignee: "Nguyễn Kỹ Thuật", status: inv.matchAcceptance ? "approved" : "pending", actionAt: inv.matchAcceptance ? inv.submittedAt : null, note: "Nghiệm thu hiện trường" },
        { step: 2, role: "Kế toán trưởng", assignee: "Phạm Kế Toán", status: "pending", actionAt: null, note: "Kiểm tra 3-way + số tiền" },
        { step: 3, role: "Quản lý dự án (QLDA)", assignee: "Trần QLDA", status: "pending", actionAt: null, note: "Phê duyệt cuối" },
        { step: 4, role: "Chi thanh toán", assignee: "Hệ thống / Ngân hàng", status: "pending", actionAt: null, note: "Chuyển khoản NCC" },
      ];

      const newWf = currentWorkflow.map((w: any) =>
        w.step === step
          ? { ...w, status: approved ? (step === 4 ? "paid" : "approved") : "rejected", actionAt: new Date().toISOString().replace("T", " ").slice(0, 16) }
          : w
      );

      const allApproved = newWf.every((w: any) => w.status === "approved" || w.status === "paid");
      const paid = newWf[3]?.status === "paid";

      return {
        ...inv,
        workflow: newWf,
        approvalStatus: !approved ? "rejected" : allApproved ? "approved" : "pending",
        paidAt: paid ? new Date().toISOString().split("T")[0] : inv.paidAt,
      };
    }));

    // Update modal view with updated invoice
    const updated = invoices.find((i: any) => i.id === invoiceId);
    if (updated) setThreeWayTarget({ ...updated }); // trigger re-render
  };

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
                      <button className="action-btn" title="3-way match & workflow" style={{ background: "#e6f7ff" }}
                        onClick={() => setThreeWayTarget(inv)}>🔗</button>
                      {inv.approvalStatus === "pending" && threeWay && (
                        <button className="action-btn action-btn--view" title="Duyệt nhanh" style={{ background: "#f6ffed" }}
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
      {threeWayTarget && (
        <ThreeWayMatchModal
          invoice={invoices.find((i: any) => i.id === threeWayTarget.id) || threeWayTarget}
          onClose={() => setThreeWayTarget(null)}
          onAdvanceStep={handleAdvanceStep}
        />
      )}
    </div>
  );
}
