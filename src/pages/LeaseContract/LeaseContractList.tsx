import React, { useState, useMemo } from "react";
import {
  MOCK_LEASE_CONTRACTS, MOCK_PROJECTS, MOCK_CUSTOMERS,
  MOCK_INVOICES, MOCK_DEBTS,
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

// Days until a date (positive = future, negative = past)
const daysUntil = (dateStr: string) => {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  return Math.floor((d.getTime() - today.getTime()) / 86400000);
};

// ─── Detail Modal ─────────────────────────────────────────────────────────
function LeaseDetailModal({ contract, onClose, onUpdate }: any) {
  const [tab, setTab] = useState<"overview" | "deposit" | "escalation" | "renewal">("overview");
  const project = MOCK_PROJECTS.find((p: any) => p.id === contract.projectId);
  const invoices = MOCK_INVOICES.filter((i: any) => i.contractId === contract.id);
  const debts = MOCK_DEBTS.filter((d: any) => d.kind === "receivable" && d.counterpartyName === contract.customerName);

  const daysToEnd = daysUntil(contract.endDate);
  const currentRent = (() => {
    if (!contract.escalationSchedule || contract.escalationSchedule.length === 0) return contract.rentAmount;
    const today = new Date().toISOString().split("T")[0];
    const applied = contract.escalationSchedule.filter((e: any) => e.effectiveDate <= today).sort((a: any, b: any) => b.effectiveDate.localeCompare(a.effectiveDate))[0];
    return applied?.rentAmount || contract.rentAmount;
  })();

  const nextEscalation = contract.escalationSchedule?.find((e: any) => e.status === "scheduled" && daysUntil(e.effectiveDate)! >= 0);

  const applyEscalation = (period: number) => {
    const updated = {
      ...contract,
      escalationSchedule: contract.escalationSchedule.map((e: any) =>
        e.period === period ? { ...e, status: "applied", appliedAt: new Date().toISOString().split("T")[0] } : e
      ),
      rentAmount: contract.escalationSchedule.find((e: any) => e.period === period)?.rentAmount || contract.rentAmount,
    };
    onUpdate(updated);
    alert(`✓ Đã áp dụng tăng giá kỳ ${period}. Phí thuê mới: ${fmtMoney(updated.rentAmount)}`);
  };

  const refundDeposit = () => {
    if (!confirm("Xác nhận hoàn tiền cọc? Hành động này sẽ đánh dấu cọc đã hoàn.")) return;
    const updated = {
      ...contract,
      depositRefundedAt: new Date().toISOString().split("T")[0],
    };
    onUpdate(updated);
  };

  const sendRenewalNotice = () => {
    const updated = {
      ...contract,
      renewalStatus: "pending",
      renewalNotifiedAt: new Date().toISOString().split("T")[0],
    };
    onUpdate(updated);
    alert(`📨 Đã gửi thông báo gia hạn tới ${contract.customerName}. Thông báo trước ${contract.renewalNoticeDays} ngày.`);
  };

  const confirmRenewal = () => {
    const newStart = contract.endDate;
    const dur = new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime();
    const newEnd = new Date(new Date(contract.endDate).getTime() + dur).toISOString().split("T")[0];
    const updated = {
      ...contract,
      renewalStatus: "renewed",
      startDate: newStart,
      endDate: newEnd,
    };
    onUpdate(updated);
    alert(`🔄 Đã gia hạn hợp đồng. Hiệu lực mới: ${newStart} → ${newEnd}`);
  };

  const TABS = [
    { key: "overview", label: "Tổng quan" },
    { key: "deposit", label: "Tiền cọc" },
    { key: "escalation", label: `Lịch tăng giá (${contract.escalationSchedule?.length || 0})` },
    { key: "renewal", label: "Gia hạn" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 960, maxHeight: "90vh" }}>
        <div className="modal-header">
          <h2 className="modal-title">📄 {contract.code} — {contract.customerName}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* KPI row always visible */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, padding: "14px 20px", background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
          {[
            { label: "Phí thuê hiện tại", value: fmtMoney(currentRent), sub: "/ tháng", color: "#1890ff", icon: "💰" },
            { label: "Tiền cọc", value: fmtMoney(contract.depositAmount), sub: contract.depositPaid ? "✅ Đã nộp" : "⏳ Chưa nộp", color: contract.depositPaid ? "#52c41a" : "#faad14", icon: "🏦" },
            { label: "Còn hiệu lực", value: daysToEnd !== null && daysToEnd >= 0 ? `${daysToEnd} ngày` : "Hết hạn", sub: contract.endDate, color: daysToEnd !== null && daysToEnd < 30 ? "#ff4d4f" : daysToEnd !== null && daysToEnd < 90 ? "#faad14" : "#52c41a", icon: "⏱️" },
            { label: "Kỳ tăng giá kế", value: nextEscalation ? `+${nextEscalation.rate}%` : "—", sub: nextEscalation?.effectiveDate || "Không có", color: "#722ed1", icon: "📈" },
            { label: "Gia hạn", value: contract.autoRenew ? "Auto" : "Thủ công", sub: `Báo trước ${contract.renewalNoticeDays}d`, color: "#13c2c2", icon: "🔄" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", border: `1px solid ${s.color}33` }}>
              <div style={{ fontSize: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#8c8c8c" }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", padding: "0 20px", background: "#fff" }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              style={{ padding: "10px 18px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13,
                fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? "#1890ff" : "#8c8c8c",
                borderBottom: tab === t.key ? "2px solid #1890ff" : "2px solid transparent" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 8 }}>Thông tin hợp đồng</div>
                  {[
                    { l: "Loại", v: CONTRACT_TYPES.find((t) => t.value === contract.contractType)?.label },
                    { l: "Dự án", v: project?.name },
                    { l: "Unit", v: contract.unitCode },
                    { l: "Ngày ký", v: contract.signedDate },
                    { l: "Hiệu lực", v: `${contract.startDate} → ${contract.endDate}` },
                    { l: "Kỳ thanh toán", v: { monthly: "Hàng tháng", quarterly: "Hàng quý", "semi-annual": "6 tháng", annual: "Hàng năm" }[contract.paymentTerms] || contract.paymentTerms },
                  ].map((i, idx) => (
                    <div key={idx} style={{ display: "flex", padding: "6px 0", borderBottom: "1px solid #e8e8e8", fontSize: 13 }}>
                      <span style={{ width: 120, color: "#8c8c8c" }}>{i.l}</span>
                      <span style={{ fontWeight: 500 }}>{i.v || "—"}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 8 }}>Cấu trúc phí</div>
                  {[
                    { l: "Phí thuê gốc", v: fmtMoney(contract.rentAmount) },
                    { l: "Phí thuê hiện tại", v: fmtMoney(currentRent), highlight: true },
                    { l: "Tỉ lệ tăng giá", v: contract.escalationRate ? `${contract.escalationRate}% / kỳ review` : "—" },
                    contract.camFee > 0 ? { l: "CAM charges", v: fmtMoney(contract.camFee) } : null,
                    contract.marketingLevy > 0 ? { l: "Marketing levy", v: `${contract.marketingLevy}% doanh thu` } : null,
                    contract.turnoverRentRate > 0 ? { l: "Turnover rent", v: `${contract.turnoverRentRate}% doanh thu` } : null,
                    contract.overtimeRate > 0 ? { l: "Điều hòa ngoài giờ", v: `${fmtMoney(contract.overtimeRate)}/giờ/tầng` } : null,
                  ].filter(Boolean).map((i: any, idx: number) => (
                    <div key={idx} style={{ display: "flex", padding: "6px 0", borderBottom: "1px solid #e8e8e8", fontSize: 13 }}>
                      <span style={{ width: 140, color: "#8c8c8c" }}>{i.l}</span>
                      <span style={{ fontWeight: i.highlight ? 700 : 500, color: i.highlight ? "#1890ff" : "inherit" }}>{i.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {contract.note && (
                <div style={{ padding: 12, background: "#fffbe6", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
                  📝 <strong>Ghi chú:</strong> {contract.note}
                </div>
              )}

              {/* Linked invoices */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>💳 Hóa đơn liên quan ({invoices.length})</div>
                {invoices.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 16, color: "#8c8c8c", fontSize: 12, background: "#fafafa", borderRadius: 6 }}>Chưa có hóa đơn nào gắn với HĐ này.</div>
                ) : (
                  <table className="data-table">
                    <thead><tr><th>Mã HĐ</th><th>Kỳ</th><th>Tổng tiền</th><th>Đã TT</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                      {invoices.map((inv: any) => (
                        <tr key={inv.id}>
                          <td><span className="code-text">{inv.code}</span></td>
                          <td>{inv.period}</td>
                          <td className="amount-text">{fmtMoney(inv.totalAmount)}</td>
                          <td className="amount-text" style={{ color: "#52c41a" }}>{fmtMoney(inv.paidAmount)}</td>
                          <td><span className="status-badge" style={{ background: `${STATUS_COLORS[inv.status]}22`, color: STATUS_COLORS[inv.status] }}>{STATUS_LABELS[inv.status]}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {debts.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: "#ff4d4f" }}>⚠️ Công nợ phải thu ({debts.length})</div>
                  <div style={{ padding: 10, background: "#fff1f0", borderLeft: "3px solid #ff4d4f", borderRadius: 4, fontSize: 13 }}>
                    Khách đang nợ: <strong>{fmtMoney(debts.reduce((a: number, d: any) => a + d.amount, 0))}</strong> — mở <a href="/debt-management" style={{ color: "#1890ff" }}>Quản lý công nợ</a> để xử lý.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DEPOSIT */}
          {tab === "deposit" && (
            <div>
              <div style={{ background: contract.depositPaid ? "#f6ffed" : "#fff7e6", borderLeft: `4px solid ${contract.depositPaid ? "#52c41a" : "#faad14"}`, padding: 14, borderRadius: 6, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>Trạng thái cọc</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: contract.depositPaid ? "#52c41a" : "#faad14", marginTop: 4 }}>
                  {contract.depositRefundedAt ? "💸 Đã hoàn cọc" : contract.depositPaid ? "✅ Đã nhận cọc" : "⏳ Chưa nhận cọc"}
                </div>
                <div style={{ fontSize: 14, marginTop: 4 }}>{fmtMoney(contract.depositAmount)}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 8 }}>Thông tin nhận cọc</div>
                  {[
                    { l: "Số tiền cọc", v: fmtMoney(contract.depositAmount) },
                    { l: "Ngày nộp", v: contract.depositPaidAt || "Chưa nộp" },
                    { l: "Hình thức", v: contract.depositPaidMethod === "bank_transfer" ? "Chuyển khoản" : contract.depositPaidMethod === "cash" ? "Tiền mặt" : "—" },
                    { l: "Đang giữ tại", v: contract.depositHeldBy || "—" },
                    { l: "Có thể hoàn", v: contract.depositRefundable ? "Có (theo điều khoản)" : "Không" },
                  ].map((i, idx) => (
                    <div key={idx} style={{ display: "flex", padding: "6px 0", borderBottom: "1px solid #e8e8e8", fontSize: 13 }}>
                      <span style={{ width: 130, color: "#8c8c8c" }}>{i.l}</span>
                      <span style={{ fontWeight: 500 }}>{i.v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 8 }}>Thông tin hoàn cọc</div>
                  {contract.depositRefundedAt ? (
                    <>
                      <div style={{ padding: 10, background: "#f6ffed", borderRadius: 4, fontSize: 13 }}>
                        ✅ Đã hoàn cọc ngày <strong>{contract.depositRefundedAt}</strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 10 }}>
                        Cọc sẽ được hoàn khi HĐ kết thúc và khách hàng không còn công nợ.
                      </div>
                      <button className="btn btn-outline" style={{ width: "100%" }} onClick={refundDeposit} disabled={!contract.depositPaid || contract.status !== "expired"}>
                        💸 Hoàn cọc cho khách
                      </button>
                      {contract.status !== "expired" && (
                        <div style={{ fontSize: 11, color: "#faad14", marginTop: 6 }}>⚠ Chỉ hoàn được khi HĐ đã kết thúc.</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ESCALATION */}
          {tab === "escalation" && (
            <div>
              {!contract.escalationSchedule || contract.escalationSchedule.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: "#8c8c8c", background: "#fafafa", borderRadius: 8 }}>
                  Hợp đồng này không có lịch tăng giá. Giá cố định: <strong>{fmtMoney(contract.rentAmount)}</strong> / tháng.
                </div>
              ) : (
                <>
                  <div style={{ background: "#f5f7fa", padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
                    <strong>Điều khoản:</strong> Review giá mỗi {contract.reviewClause} năm, tăng {contract.escalationRate}% / kỳ review.
                    {nextEscalation && (
                      <div style={{ marginTop: 6, color: "#722ed1" }}>
                        📈 Kỳ tăng giá kế tiếp: <strong>{nextEscalation.effectiveDate}</strong> — phí mới <strong>{fmtMoney(nextEscalation.rentAmount)}</strong> (+{nextEscalation.rate}%)
                      </div>
                    )}
                  </div>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Kỳ</th>
                        <th>Ngày áp dụng</th>
                        <th>Tỉ lệ tăng</th>
                        <th>Phí thuê</th>
                        <th>Ghi chú</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.escalationSchedule.map((e: any) => {
                        const isApplied = e.status === "applied";
                        const daysToEff = daysUntil(e.effectiveDate);
                        return (
                          <tr key={e.period}>
                            <td><strong>#{e.period}</strong></td>
                            <td style={{ fontSize: 12 }}>{e.effectiveDate}</td>
                            <td style={{ fontWeight: 600, color: e.rate > 0 ? "#ff4d4f" : "#8c8c8c" }}>{e.rate > 0 ? `+${e.rate}%` : "—"}</td>
                            <td className="amount-text" style={{ fontWeight: 600 }}>{fmtMoney(e.rentAmount)}</td>
                            <td style={{ fontSize: 11, color: "#595959", maxWidth: 180 }}>{e.note}</td>
                            <td>
                              <span className="status-badge" style={{
                                background: isApplied ? "#f6ffed" : daysToEff !== null && daysToEff <= 30 ? "#fff7e6" : "#e6f7ff",
                                color: isApplied ? "#52c41a" : daysToEff !== null && daysToEff <= 30 ? "#faad14" : "#1890ff",
                              }}>
                                {isApplied ? "Đã áp dụng" : "Đã lên lịch"}
                              </span>
                            </td>
                            <td>
                              {!isApplied && e.rate > 0 && (
                                <button className="btn btn-outline" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => applyEscalation(e.period)}>
                                  ⚡ Áp dụng
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div style={{ marginTop: 12, fontSize: 11, color: "#8c8c8c", fontStyle: "italic" }}>
                    💡 Khi áp dụng tăng giá, hệ thống sẽ dùng phí mới cho các hóa đơn kỳ kế tiếp. Hóa đơn đã phát hành không bị ảnh hưởng.
                  </div>
                </>
              )}
            </div>
          )}

          {/* RENEWAL */}
          {tab === "renewal" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div style={{ background: contract.autoRenew ? "#f6ffed" : "#fff7e6", padding: 14, borderRadius: 8, border: `1.5px solid ${contract.autoRenew ? "#52c41a" : "#faad14"}` }}>
                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>Cơ chế gia hạn</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: contract.autoRenew ? "#52c41a" : "#faad14" }}>
                    {contract.autoRenew ? "🔄 Auto-renew" : "✍️ Thủ công"}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    Thông báo trước <strong>{contract.renewalNoticeDays}</strong> ngày trước khi hết hạn.
                  </div>
                </div>

                <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>Hạn hợp đồng hiện tại</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{contract.endDate}</div>
                  <div style={{ fontSize: 12, marginTop: 6, color: daysToEnd !== null && daysToEnd < 30 ? "#ff4d4f" : daysToEnd !== null && daysToEnd < 90 ? "#faad14" : "#52c41a" }}>
                    {daysToEnd !== null && daysToEnd >= 0 ? `Còn ${daysToEnd} ngày` : "Đã hết hạn"}
                  </div>
                </div>
              </div>

              <div style={{ background: "#fafafa", padding: 14, borderRadius: 8, marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>📋 Trạng thái gia hạn</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="status-badge" style={{
                    background: contract.renewalStatus === "renewed" ? "#f6ffed" : contract.renewalStatus === "pending" ? "#fff7e6" : "#f5f5f5",
                    color: contract.renewalStatus === "renewed" ? "#52c41a" : contract.renewalStatus === "pending" ? "#faad14" : "#8c8c8c",
                    fontSize: 13, padding: "6px 14px",
                  }}>
                    {contract.renewalStatus === "renewed" ? "✅ Đã gia hạn" : contract.renewalStatus === "pending" ? "⏳ Chờ khách hàng xác nhận" : "— Chưa có thao tác"}
                  </span>
                  {contract.renewalNotifiedAt && (
                    <span style={{ fontSize: 12, color: "#8c8c8c" }}>Đã gửi thông báo ngày {contract.renewalNotifiedAt}</span>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button className="btn btn-outline" onClick={sendRenewalNotice} disabled={contract.renewalStatus === "renewed"}>
                  📨 Gửi thông báo gia hạn cho KH
                </button>
                <button className="btn btn-primary" onClick={confirmRenewal} disabled={contract.renewalStatus === "renewed"}>
                  ✅ Xác nhận gia hạn thêm {Math.round((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / 86400000 / 30)} tháng
                </button>
              </div>

              <div style={{ marginTop: 12, fontSize: 11, color: "#8c8c8c", fontStyle: "italic" }}>
                💡 Auto-renew tự động kích hoạt khi còn {contract.renewalNoticeDays} ngày. Thủ công yêu cầu xác nhận song phương.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

  const [contracts, setContracts] = useState<any[]>(MOCK_LEASE_CONTRACTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailTarget, setDetailTarget] = useState<any>(null);

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

  const totalRent = filtered.filter((c: any) => c.status === "active").reduce((a: number, c: any) => a + (c.rentAmount || 0), 0);
  const totalDepositHeld = contracts.filter((c: any) => c.depositPaid && !c.depositRefundedAt && c.status === "active").reduce((a: number, c: any) => a + (c.depositAmount || 0), 0);
  const expiringSoon = contracts.filter((c: any) => {
    if (c.status !== "active") return false;
    const d = daysUntil(c.endDate);
    return d !== null && d >= 0 && d <= 30;
  }).length;
  const needsRenewalNotice = contracts.filter((c: any) => {
    if (c.status !== "active" || c.renewalStatus === "renewed") return false;
    const d = daysUntil(c.endDate);
    return d !== null && d >= 0 && d <= c.renewalNoticeDays;
  }).length;

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Tổng HĐ / Đang hiệu lực", value: `${contracts.filter((c: any) => c.status === "active").length}/${contracts.length}`, color: "#1890ff", icon: "📄" },
          { label: "Tổng phí thuê / tháng", value: fmtMoney(totalRent), color: "#722ed1", icon: "💰" },
          { label: "Tiền cọc đang giữ", value: fmtMoney(totalDepositHeld), color: "#13c2c2", icon: "🏦" },
          { label: "Sắp hết hạn (≤30 ngày)", value: `${expiringSoon} HĐ`, color: expiringSoon > 0 ? "#faad14" : "#8c8c8c", icon: "⏱️" },
          { label: "Cần gửi TB gia hạn", value: `${needsRenewalNotice} HĐ`, color: needsRenewalNotice > 0 ? "#ff4d4f" : "#52c41a", icon: "🔔" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>{s.label}</div>
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
                      <button className="action-btn" onClick={() => setDetailTarget(c)} title="Xem chi tiết">👁</button>
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
      {detailTarget && !showModal && (
        <LeaseDetailModal
          contract={detailTarget}
          onClose={() => setDetailTarget(null)}
          onUpdate={(updated: any) => {
            setContracts((prev: any) => prev.map((c: any) => (c.id === updated.id ? updated : c)));
            setDetailTarget(updated);
          }}
        />
      )}

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
