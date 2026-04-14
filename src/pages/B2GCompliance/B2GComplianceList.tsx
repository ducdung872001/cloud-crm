import React, { useState, useMemo } from "react";
import { MOCK_B2G_BUDGETS, MOCK_B2G_PAYMENTS, MOCK_PROJECTS } from "assets/mock/TNPMData";
import { PageHeader, KpiRow, TabBar, ModalShell, StatusBadge, fmtMoney } from "components/tnpm";

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending_qlda: { label: "Chờ QLDA duyệt", color: "#faad14" },
  pending_accountant: { label: "Chờ Kế toán duyệt", color: "#faad14" },
  pending_director: { label: "Chờ Giám đốc duyệt", color: "#fa8c16" },
  pending_treasury: { label: "Chờ Kho bạc chi", color: "#1890ff" },
  paid: { label: "Đã thanh toán", color: "#52c41a" },
  rejected: { label: "Từ chối", color: "#ff4d4f" },
};

// ─── Payment Detail Modal ─────────────────────────────────────────────────
function PaymentDetailModal({ payment, onClose, onApprove, onReject }: any) {
  const [actionNote, setActionNote] = useState("");

  const nextStep = payment.workflow.find((w: any) => w.status === "pending");

  return (
    <ModalShell
      title={`📄 ${payment.code} — Đề nghị thanh toán`}
      onClose={onClose}
      wide
      maxWidth={860}
    >
          {/* Header info */}
          <div style={{ background: "#f5f7fa", padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Dự án</div>
                <div style={{ fontWeight: 600 }}>{payment.projectName}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Số tiền</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#ff4d4f" }}>{fmtMoney(payment.amount)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Đối tượng nhận</div>
                <div style={{ fontWeight: 600 }}>{payment.vendorName}</div>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>HĐ: {payment.invoiceRef}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Hạn thanh toán</div>
                <div>{payment.dueDate}</div>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>Yêu cầu: {payment.requestDate}</div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Nội dung</div>
                <div style={{ fontSize: 13 }}>{payment.description}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Người đề nghị</div>
                <div style={{ fontSize: 13 }}>{payment.requestedBy}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Danh mục ngân sách</div>
                <div style={{ fontSize: 13 }}>{payment.category}</div>
              </div>
            </div>
          </div>

          {/* Workflow timeline */}
          <div style={{ fontWeight: 600, marginBottom: 12 }}>⚙️ Luồng phê duyệt</div>
          <div style={{ position: "relative" }}>
            {payment.workflow.map((step: any, idx: number) => {
              const isApproved = step.status === "approved" || step.status === "paid";
              const isCurrent = step.status === "pending" && !payment.workflow.slice(0, idx).some((w: any) => w.status === "pending");
              const isPending = step.status === "pending" && !isCurrent;

              return (
                <div key={step.step} style={{ display: "flex", marginBottom: 16, gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: isApproved ? "#52c41a" : isCurrent ? "#faad14" : "#f0f0f0",
                      color: isApproved || isCurrent ? "#fff" : "#8c8c8c",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 14,
                      border: isCurrent ? "2px solid #fa8c16" : "none",
                    }}>
                      {isApproved ? "✓" : step.step}
                    </div>
                    {idx < payment.workflow.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: isApproved ? "#52c41a" : "#f0f0f0", marginTop: 4, minHeight: 20 }} />
                    )}
                  </div>
                  <div style={{ flex: 1, padding: "4px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{step.role}</div>
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>{step.assignee}</div>
                      </div>
                      <span className="status-badge" style={{
                        background: isApproved ? "#f6ffed" : isCurrent ? "#fff7e6" : "#fafafa",
                        color: isApproved ? "#52c41a" : isCurrent ? "#faad14" : "#8c8c8c",
                      }}>
                        {step.status === "paid" ? "Đã chi" : step.status === "approved" ? "Đã duyệt" : isCurrent ? "ĐANG XỬ LÝ" : "Chờ"}
                      </span>
                    </div>
                    {step.actionAt && (
                      <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>📅 {step.actionAt}</div>
                    )}
                    {step.note && (
                      <div style={{ fontSize: 12, color: "#595959", marginTop: 4, padding: 8, background: isApproved ? "#f6ffed" : "#fafafa", borderRadius: 4 }}>
                        💬 {step.note}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action box for current step */}
          {nextStep && payment.status !== "paid" && payment.status !== "rejected" && (
            <div style={{ marginTop: 16, padding: 14, background: "#fff7e6", borderLeft: "4px solid #faad14", borderRadius: 6 }}>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>
                🖊️ Đang chờ <span style={{ color: "#fa8c16" }}>{nextStep.role}</span> xử lý
              </div>
              <textarea className="form-control" rows={2} value={actionNote} onChange={(e) => setActionNote(e.target.value)} placeholder="Ghi chú phê duyệt / lý do từ chối..." style={{ marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-outline" style={{ color: "#ff4d4f", borderColor: "#ff4d4f" }} onClick={() => { onReject(actionNote); setActionNote(""); }}>
                  ✗ Từ chối
                </button>
                <button className="btn btn-primary" style={{ background: "#52c41a" }} onClick={() => { onApprove(actionNote); setActionNote(""); }}>
                  ✓ Phê duyệt
                </button>
              </div>
            </div>
          )}

          {payment.status === "paid" && (
            <div style={{ marginTop: 16, padding: 14, background: "#f6ffed", borderLeft: "4px solid #52c41a", borderRadius: 6 }}>
              <div style={{ fontWeight: 600, color: "#52c41a" }}>✅ Đã thanh toán xong</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>
                Ngày chi: <strong>{payment.paidAt}</strong> · UNC: <span className="code-text">{payment.paymentRef}</span>
              </div>
            </div>
          )}
    </ModalShell>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function B2GComplianceList() {
  document.title = "B2G Compliance – Dự án Hành chính công";

  const [payments, setPayments] = useState<any[]>(MOCK_B2G_PAYMENTS);
  const [budgets] = useState<any[]>(MOCK_B2G_BUDGETS);
  const [activeTab, setActiveTab] = useState<"dashboard" | "payments" | "budgets">("dashboard");
  const [filterStatus, setFilterStatus] = useState("all");
  const [detailTarget, setDetailTarget] = useState<any>(null);

  const filteredPayments = useMemo(() => {
    return payments.filter((p: any) => {
      if (filterStatus === "all") return true;
      if (filterStatus === "pending") return p.status !== "paid" && p.status !== "rejected";
      if (filterStatus === "paid") return p.status === "paid";
      return p.status === filterStatus;
    });
  }, [payments, filterStatus]);

  // KPI
  const totalBudget = budgets.reduce((a: number, b: any) => a + b.totalBudget, 0);
  const totalUsed = budgets.reduce((a: number, b: any) => a + b.usedBudget, 0);
  const totalRemaining = totalBudget - totalUsed;
  const usagePct = totalBudget > 0 ? (totalUsed / totalBudget * 100) : 0;
  const pendingPayments = payments.filter((p: any) => p.status !== "paid" && p.status !== "rejected").length;
  const pendingAmount = payments.filter((p: any) => p.status !== "paid" && p.status !== "rejected").reduce((a: number, p: any) => a + p.amount, 0);

  const advanceWorkflow = (id: number, approved: boolean, note: string) => {
    setPayments((prev: any) => prev.map((p: any) => {
      if (p.id !== id) return p;
      const nextStepIdx = p.workflow.findIndex((w: any) => w.status === "pending");
      if (nextStepIdx === -1) return p;

      const newWorkflow = [...p.workflow];
      newWorkflow[nextStepIdx] = {
        ...newWorkflow[nextStepIdx],
        status: approved ? (nextStepIdx === newWorkflow.length - 1 ? "paid" : "approved") : "rejected",
        actionAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        note: note || (approved ? "Phê duyệt" : "Từ chối"),
      };

      // Determine new overall status
      let newStatus = p.status;
      if (!approved) {
        newStatus = "rejected";
      } else if (nextStepIdx === newWorkflow.length - 1) {
        newStatus = "paid";
      } else {
        const nextPending = newWorkflow[nextStepIdx + 1];
        if (nextPending?.role === "Kế toán trưởng") newStatus = "pending_accountant";
        else if (nextPending?.role === "Giám đốc") newStatus = "pending_director";
        else if (nextPending?.role === "Kho bạc Nhà nước") newStatus = "pending_treasury";
      }

      return {
        ...p,
        workflow: newWorkflow,
        status: newStatus,
        paidAt: newStatus === "paid" ? new Date().toISOString().split("T")[0] : p.paidAt,
        paymentRef: newStatus === "paid" ? `UNC-${new Date().toISOString().replace(/[-T:]/g, "").slice(0, 14)}` : p.paymentRef,
      };
    }));

    const updatedPayment = payments.find((p: any) => p.id === id);
    if (updatedPayment) setDetailTarget(null);
  };

  return (
    <div className="tnpm-list-page">
      <PageHeader
        title="🏛️ B2G Compliance — Dự án Hành chính công"
        subtitle="Ngân sách, phê duyệt đa cấp và thanh toán qua Kho bạc Nhà nước cho các dự án khu liên cơ quan HC"
        actions={<button className="btn btn-primary" onClick={() => alert("Tạo đề nghị thanh toán mới — form đầy đủ (coming soon)")}>+ Tạo đề nghị TT</button>}
      />

      <KpiRow items={[
        { label: "Tổng ngân sách năm", value: fmtMoney(totalBudget), sub: `${budgets.length} dự án HC`, color: "#1890ff", icon: "💰" },
        { label: "Đã sử dụng", value: fmtMoney(totalUsed), sub: `${usagePct.toFixed(1)}%`, color: "#fa8c16", icon: "📊" },
        { label: "Còn lại", value: fmtMoney(totalRemaining), sub: `${(100 - usagePct).toFixed(1)}%`, color: "#52c41a", icon: "💵" },
        { label: "Chờ phê duyệt", value: `${pendingPayments} đề nghị`, sub: fmtMoney(pendingAmount), color: "#faad14", icon: "⏳" },
        { label: "Đã chi kho bạc", value: `${payments.filter((p: any) => p.status === "paid").length} GD`, sub: fmtMoney(payments.filter((p: any) => p.status === "paid").reduce((a: number, p: any) => a + p.amount, 0)), color: "#722ed1", icon: "✅" },
      ]} />

      <TabBar
        tabs={[
          { key: "dashboard", label: "📊 Tổng quan ngân sách" },
          { key: "payments", label: "📋 Đề nghị thanh toán", count: payments.length },
          { key: "budgets", label: "💰 Ngân sách & phân bổ", count: budgets.length },
        ]}
        active={activeTab}
        onChange={(k) => setActiveTab(k as any)}
      />

      {/* DASHBOARD tab */}
      {activeTab === "dashboard" && (
        <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          {budgets.map((b: any) => (
            <div key={b.id} style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{b.projectName} — Năm {b.year}</div>
              <div style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 12 }}>
                Duyệt theo {b.approvalDoc} — {b.approvalDate} · Đơn vị duyệt: <strong>{b.approvedBy}</strong>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span>Tổng ngân sách: <strong>{fmtMoney(b.totalBudget)}</strong></span>
                  <span>Đã dùng: <strong style={{ color: "#fa8c16" }}>{fmtMoney(b.usedBudget)}</strong> ({((b.usedBudget / b.totalBudget) * 100).toFixed(1)}%)</span>
                </div>
                <div style={{ height: 18, background: "#f0f0f0", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{
                    width: `${(b.usedBudget / b.totalBudget) * 100}%`,
                    height: "100%", background: "linear-gradient(90deg, #52c41a 0%, #faad14 70%, #ff4d4f 100%)",
                    transition: "width 0.4s",
                  }} />
                </div>
              </div>

              {/* Category breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                {b.categories.map((cat: any) => {
                  const pct = (cat.used / cat.budget) * 100;
                  return (
                    <div key={cat.code} style={{ background: "#fafafa", padding: 12, borderRadius: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{cat.label}</span>
                        <span style={{ fontSize: 11, color: "#8c8c8c" }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div style={{ height: 6, background: "#e8e8e8", borderRadius: 3, marginBottom: 6 }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: pct > 80 ? "#ff4d4f" : pct > 60 ? "#faad14" : "#52c41a", borderRadius: 3 }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#595959" }}>
                        {fmtMoney(cat.used)} / <strong>{fmtMoney(cat.budget)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {b.note && (
                <div style={{ marginTop: 12, padding: 10, background: "#fffbe6", borderRadius: 6, fontSize: 12 }}>
                  📝 {b.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PAYMENTS tab */}
      {activeTab === "payments" && (
        <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 10, padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
            <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Đang xử lý</option>
              <option value="pending_qlda">Chờ QLDA</option>
              <option value="pending_accountant">Chờ Kế toán</option>
              <option value="pending_director">Chờ Giám đốc</option>
              <option value="pending_treasury">Chờ Kho bạc</option>
              <option value="paid">Đã thanh toán</option>
              <option value="rejected">Từ chối</option>
            </select>
            <span style={{ marginLeft: "auto", fontSize: 13, color: "#8c8c8c", alignSelf: "center" }}>
              {filteredPayments.length} đề nghị
            </span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã ĐNTT</th>
                <th>Dự án</th>
                <th>Đối tượng / Nội dung</th>
                <th>Số tiền</th>
                <th>Danh mục NS</th>
                <th>Hạn TT</th>
                <th>Bước hiện tại</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p: any) => {
                const statusMeta = STATUS_META[p.status] || { label: p.status, color: "#8c8c8c" };
                const currentStep = p.workflow.find((w: any) => w.status === "pending");
                return (
                  <tr key={p.id}>
                    <td><span className="code-text">{p.code}</span></td>
                    <td style={{ fontSize: 12 }}>{p.projectName}</td>
                    <td style={{ maxWidth: 280 }}>
                      <div style={{ fontWeight: 500 }}>{p.vendorName}</div>
                      <div style={{ fontSize: 11, color: "#8c8c8c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</div>
                    </td>
                    <td className="amount-text" style={{ fontWeight: 600, color: "#ff4d4f" }}>{fmtMoney(p.amount)}</td>
                    <td style={{ fontSize: 12 }}>{p.category}</td>
                    <td style={{ fontSize: 12 }}>{p.dueDate}</td>
                    <td>
                      <StatusBadge label={statusMeta.label} color={statusMeta.color} />
                      {currentStep && (
                        <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 2 }}>
                          Bước {currentStep.step}/{p.workflow.length}
                        </div>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setDetailTarget(p)}>
                        👁 Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* BUDGETS tab */}
      {activeTab === "budgets" && (
        <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          {budgets.map((b: any) => (
            <div key={b.id} style={{ marginBottom: 24, border: "1px solid #f0f0f0", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{b.projectName}</div>
                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>Năm {b.year}</div>
                </div>
                <StatusBadge label={b.status === "active" ? "Đang áp dụng" : b.status} color="#52c41a" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
                <div style={{ background: "#f5f7fa", padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>Tổng NS</div>
                  <div style={{ fontWeight: 700, color: "#1890ff" }}>{fmtMoney(b.totalBudget)}</div>
                </div>
                <div style={{ background: "#f5f7fa", padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>Đã dùng</div>
                  <div style={{ fontWeight: 700, color: "#fa8c16" }}>{fmtMoney(b.usedBudget)}</div>
                </div>
                <div style={{ background: "#f5f7fa", padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>Còn lại</div>
                  <div style={{ fontWeight: 700, color: "#52c41a" }}>{fmtMoney(b.remainingBudget)}</div>
                </div>
                <div style={{ background: "#f5f7fa", padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>Duyệt bởi</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{b.approvedBy}</div>
                  <div style={{ fontSize: 10, color: "#8c8c8c" }}>{b.approvalDoc}</div>
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Chi tiết phân bổ ngân sách</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mục</th>
                    <th>Ngân sách</th>
                    <th>Đã chi</th>
                    <th>Còn lại</th>
                    <th>% dùng</th>
                  </tr>
                </thead>
                <tbody>
                  {b.categories.map((cat: any) => {
                    const pct = (cat.used / cat.budget) * 100;
                    return (
                      <tr key={cat.code}>
                        <td>{cat.label}</td>
                        <td className="amount-text">{fmtMoney(cat.budget)}</td>
                        <td className="amount-text" style={{ color: "#fa8c16" }}>{fmtMoney(cat.used)}</td>
                        <td className="amount-text" style={{ color: "#52c41a" }}>{fmtMoney(cat.budget - cat.used)}</td>
                        <td style={{ textAlign: "right", color: pct > 80 ? "#ff4d4f" : pct > 60 ? "#faad14" : "#52c41a", fontWeight: 600 }}>
                          {pct.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {detailTarget && (
        <PaymentDetailModal
          payment={detailTarget}
          onClose={() => setDetailTarget(null)}
          onApprove={(note: string) => advanceWorkflow(detailTarget.id, true, note)}
          onReject={(note: string) => advanceWorkflow(detailTarget.id, false, note)}
        />
      )}
    </div>
  );
}
