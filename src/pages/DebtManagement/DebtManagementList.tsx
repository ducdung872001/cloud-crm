import React, { useState, useMemo } from "react";
import {
  MOCK_DEBTS,
  MOCK_DEBT_TRANSACTIONS,
  MOCK_PAYMENT_METHODS,
  MOCK_FUNDS,
  MOCK_PROJECTS,
  STATUS_COLORS,
} from "assets/mock/TNPMData";
import { PageHeader, KpiRow, TabBar, ModalShell, StatusBadge, fmtMoney } from "components/tnpm";

const DEBT_STATUS_LABELS: Record<string, string> = {
  overdue: "Quá hạn",
  upcoming: "Sắp đến hạn",
  open: "Còn hạn",
  paid: "Đã thanh toán",
};

const DEBT_STATUS_COLORS: Record<string, string> = {
  overdue: "#ff4d4f",
  upcoming: "#faad14",
  open: "#52c41a",
  paid: "#8c8c8c",
};

function getDaysLabel(daysRemaining: number): { text: string; color: string } {
  if (daysRemaining < 0) return { text: `Quá ${Math.abs(daysRemaining)} ngày`, color: "#ff4d4f" };
  if (daysRemaining === 0) return { text: "Hôm nay", color: "#faad14" };
  if (daysRemaining <= 10) return { text: `Còn ${daysRemaining} ngày`, color: "#faad14" };
  return { text: `Còn ${daysRemaining} ngày`, color: "#52c41a" };
}

// ─── Pay Modal ────────────────────────────────────────────────────────────
function PayModal({ debt, onClose, onPay }: any) {
  const [amount, setAmount] = useState(debt.amount);
  const [methodId, setMethodId] = useState(MOCK_PAYMENT_METHODS.find((m: any) => m.enabled)?.id || 1);
  const [fundId, setFundId] = useState(MOCK_FUNDS[0]?.id || 1);
  const [note, setNote] = useState("");
  const [transDate, setTransDate] = useState(new Date().toISOString().split("T")[0]);

  const handlePay = () => {
    if (amount <= 0) return alert("Số tiền phải lớn hơn 0");
    if (amount > debt.amount) return alert(`Số tiền vượt quá nợ còn lại (${fmtMoney(debt.amount)})`);
    onPay({ amount, methodId, fundId, note, transDate });
  };

  const isFull = amount === debt.amount;
  const isPartial = amount > 0 && amount < debt.amount;
  const isReceivable = debt.kind === "receivable";

  return (
    <ModalShell
      title={isReceivable ? "💰 Thu nợ khách hàng" : "💸 Thanh toán cho NCC"}
      onClose={onClose}
      maxWidth={560}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Hủy</button>
        <button className="btn btn-primary" onClick={handlePay}>✓ Xác nhận {isReceivable ? "thu tiền" : "thanh toán"}</button>
      </>}
    >
          {/* Debt summary */}
          <div style={{ background: "#f5f7fa", borderRadius: 8, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#8c8c8c", fontSize: 13 }}>Đối tượng</span>
              <strong>{debt.counterpartyName}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#8c8c8c", fontSize: 13 }}>Hóa đơn / Phiếu</span>
              <span className="code-text">{debt.refCode}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#8c8c8c", fontSize: 13 }}>Nợ gốc</span>
              <span>{fmtMoney(debt.originalAmount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8c8c8c", fontSize: 13 }}>Còn nợ</span>
              <strong style={{ color: "#ff4d4f", fontSize: 18 }}>{fmtMoney(debt.amount)}</strong>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Số tiền {isReceivable ? "thu" : "thanh toán"} lần này</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="form-control"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(+e.target.value || 0)}
                />
                <button type="button" className="btn btn-outline" style={{ whiteSpace: "nowrap" }} onClick={() => setAmount(debt.amount)}>
                  {isReceivable ? "Thu đủ" : "Trả đủ"}
                </button>
              </div>
              <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{fmtMoney(amount)}</div>
            </div>
            <div className="form-group">
              <label>Ngày giao dịch</label>
              <input className="form-control" type="date" value={transDate} onChange={(e) => setTransDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phương thức thanh toán</label>
              <select className="form-control" value={methodId} onChange={(e) => setMethodId(+e.target.value)}>
                {MOCK_PAYMENT_METHODS.filter((m: any) => m.enabled).map((m: any) => (
                  <option key={m.id} value={m.id}>{m.icon} {m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quỹ nhận tiền</label>
              <select className="form-control" value={fundId} onChange={(e) => setFundId(+e.target.value)}>
                {MOCK_FUNDS.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name} — {fmtMoney(f.balance)}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Ghi chú</label>
              <input className="form-control" value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: Khách chuyển khoản tại quầy lễ tân..." />
            </div>
          </div>

          <div style={{ marginTop: 12, padding: 12, background: isFull ? "#f6ffed" : isPartial ? "#fffbe6" : "#fff1f0", borderRadius: 6, fontSize: 12 }}>
            {isFull && <span style={{ color: "#52c41a" }}>✓ Gạch nợ hoàn toàn — công nợ sẽ được đóng.</span>}
            {isPartial && <span style={{ color: "#faad14" }}>⚠ Thu một phần — còn lại {fmtMoney(debt.amount - amount)}.</span>}
            {amount <= 0 && <span style={{ color: "#ff4d4f" }}>✗ Chưa nhập số tiền hợp lệ.</span>}
          </div>
    </ModalShell>
  );
}

// ─── Edit Schedule Modal ─────────────────────────────────────────────────
function EditScheduleModal({ debt, onClose, onSave }: any) {
  const [dueDate, setDueDate] = useState(debt.dueDate);
  const [reminderDate, setReminderDate] = useState(debt.reminderDate);

  return (
    <ModalShell
      title="📅 Sửa hạn & nhắc nhở"
      onClose={onClose}
      maxWidth={480}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Hủy</button>
        <button className="btn btn-primary" onClick={() => onSave({ dueDate, reminderDate })}>💾 Lưu thay đổi</button>
      </>}
    >
          <div style={{ background: "#f5f7fa", borderRadius: 8, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#8c8c8c", fontSize: 13 }}>Đối tượng</span>
              <strong>{debt.counterpartyName}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8c8c8c", fontSize: 13 }}>Còn nợ</span>
              <strong style={{ color: "#ff4d4f" }}>{fmtMoney(debt.amount)}</strong>
            </div>
          </div>
          <div className="form-group">
            <label>Hạn thanh toán mới</label>
            <input className="form-control" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Ngày nhắc nhở</label>
            <input className="form-control" type="date" value={reminderDate} max={dueDate} onChange={(e) => setReminderDate(e.target.value)} />
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>📱 Hệ thống sẽ gửi thông báo FCM + email lúc 08:00 ngày nhắc nhở</div>
          </div>
    </ModalShell>
  );
}

// ─── History Modal ────────────────────────────────────────────────────────
function HistoryModal({ debt, onClose }: any) {
  const history = MOCK_DEBT_TRANSACTIONS.filter((tx: any) => tx.debtId === debt.id);
  return (
    <ModalShell
      title={`📜 Lịch sử giao dịch — ${debt.counterpartyName}`}
      onClose={onClose}
      maxWidth={720}
    >
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "#8c8c8c" }}>Chưa có giao dịch nào được ghi nhận cho công nợ này.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã GD</th>
                  <th>Ngày</th>
                  <th>Loại</th>
                  <th>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx: any) => (
                  <tr key={tx.id}>
                    <td><span className="code-text">{tx.code}</span></td>
                    <td>{tx.transDate}</td>
                    <td>{tx.type === "collect_debt" ? "Thu nợ" : tx.type === "pay_debt" ? "Trả nợ" : "Ghi nhận"}</td>
                    <td className="amount-text" style={{ color: "#52c41a" }}>{fmtMoney(tx.amount)}</td>
                    <td>{tx.paymentMethodLabel}</td>
                    <td style={{ fontSize: 12, color: "#595959" }}>{tx.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
    </ModalShell>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function DebtManagementList() {
  document.title = "Quản lý Công nợ – TNPM";

  const [debts, setDebts] = useState(MOCK_DEBTS);
  const [search, setSearch] = useState("");
  const [filterKind, setFilterKind] = useState<"all" | "receivable" | "payable">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "overdue" | "upcoming" | "open">("all");
  const [filterProject, setFilterProject] = useState("");
  const [payTarget, setPayTarget] = useState<any>(null);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [historyTarget, setHistoryTarget] = useState<any>(null);

  const filtered = useMemo(() => {
    return debts.filter((d: any) => {
      const q = search.toLowerCase();
      if (search && !d.counterpartyName.toLowerCase().includes(q) && !d.refCode.toLowerCase().includes(q)) return false;
      if (filterKind !== "all" && d.kind !== filterKind) return false;
      if (filterStatus !== "all" && d.status !== filterStatus) return false;
      if (filterProject && String(d.projectId) !== filterProject) return false;
      return d.status !== "paid";
    });
  }, [debts, search, filterKind, filterStatus, filterProject]);

  // KPI
  const totalReceivable = debts.filter((d: any) => d.kind === "receivable" && d.status !== "paid").reduce((a: number, d: any) => a + d.amount, 0);
  const totalPayable = debts.filter((d: any) => d.kind === "payable" && d.status !== "paid").reduce((a: number, d: any) => a + d.amount, 0);
  const overdueCount = debts.filter((d: any) => d.status === "overdue").length;
  const counterpartyCount = new Set(debts.filter((d: any) => d.status !== "paid").map((d: any) => d.counterpartyName)).size;

  const handlePay = (data: any) => {
    setDebts((prev: any) =>
      prev.map((d: any) => {
        if (d.id !== payTarget.id) return d;
        const newPaid = d.paidAmount + data.amount;
        const newRemaining = d.originalAmount - newPaid;
        return {
          ...d,
          paidAmount: newPaid,
          amount: newRemaining,
          status: newRemaining <= 0 ? "paid" : d.status,
        };
      })
    );
    setPayTarget(null);
    alert(`✓ Ghi nhận thành công ${fmtMoney(data.amount)}. Hệ thống đã gạch nợ ${data.amount >= payTarget.amount ? "hoàn toàn" : "một phần"}.`);
  };

  const handleSaveSchedule = (data: any) => {
    setDebts((prev: any) =>
      prev.map((d: any) => (d.id === editTarget.id ? { ...d, dueDate: data.dueDate, reminderDate: data.reminderDate } : d))
    );
    setEditTarget(null);
  };

  return (
    <div className="tnpm-list-page">
      <PageHeader
        title="💼 Quản lý Công nợ"
        subtitle="Theo dõi công nợ phải thu từ khách hàng và phải trả nhà cung cấp"
        actions={<>
          <button className="btn btn-outline">📊 Xuất Excel</button>
          <button className="btn btn-primary" onClick={() => alert("Chức năng: mở form tạo giao dịch công nợ (xem trang Giao dịch công nợ)")}>
            + Tạo giao dịch
          </button>
        </>}
      />

      <KpiRow columns={4} items={[
        { label: "Tổng phải thu", value: fmtMoney(totalReceivable), color: "#52c41a", icon: "📥" },
        { label: "Tổng phải trả", value: fmtMoney(totalPayable), color: "#ff4d4f", icon: "📤" },
        { label: "Công nợ quá hạn", value: `${overdueCount} khoản`, color: "#faad14", icon: "⚠️" },
        { label: "Số đối tượng", value: `${counterpartyCount}`, color: "#1890ff", icon: "👥" },
      ]} />

      <TabBar
        tabs={[
          { key: "all", label: "Tất cả", count: debts.filter((d: any) => d.status !== "paid").length },
          { key: "receivable", label: "Phải thu", count: debts.filter((d: any) => d.kind === "receivable" && d.status !== "paid").length },
          { key: "payable", label: "Phải trả", count: debts.filter((d: any) => d.kind === "payable" && d.status !== "paid").length },
        ]}
        active={filterKind}
        onChange={(k) => setFilterKind(k as any)}
        rightSlot={<>
          <input className="search-input" style={{ width: 220 }} placeholder="🔍 Tìm tên, mã HĐ..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="overdue">Quá hạn</option>
            <option value="upcoming">Sắp đến hạn</option>
            <option value="open">Còn hạn</option>
          </select>
          <select className="filter-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
            <option value="">Tất cả dự án</option>
            {MOCK_PROJECTS.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </>}
      />

      <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Đối tượng</th>
              <th>Loại nợ</th>
              <th>Dự án</th>
              <th>Hóa đơn</th>
              <th>Nợ gốc</th>
              <th>Còn lại</th>
              <th>Hạn TT</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có công nợ nào phù hợp với bộ lọc.</td></tr>
            )}
            {filtered.map((d: any) => {
              const days = getDaysLabel(d.daysRemaining);
              const isReceivable = d.kind === "receivable";
              return (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500, maxWidth: 180 }}>
                    <div>{d.counterpartyName}</div>
                    <div style={{ fontSize: 11, color: "#8c8c8c" }}>{d.counterpartyType === "customer" ? "Khách hàng" : "Nhà cung cấp"}</div>
                  </td>
                  <td>
                    <StatusBadge label={isReceivable ? "Phải thu" : "Phải trả"} color={isReceivable ? "#1890ff" : "#ff4d4f"} />
                  </td>
                  <td style={{ fontSize: 12, color: "#595959" }}>{d.projectName}</td>
                  <td><span className="code-text">{d.refCode}</span></td>
                  <td className="amount-text">{fmtMoney(d.originalAmount)}</td>
                  <td className="amount-text" style={{ color: "#ff4d4f", fontWeight: 600 }}>{fmtMoney(d.amount)}</td>
                  <td style={{ fontSize: 12 }}>{d.dueDate}</td>
                  <td style={{ fontSize: 12, color: days.color, fontWeight: 500 }}>{days.text}</td>
                  <td>
                    <StatusBadge label={DEBT_STATUS_LABELS[d.status]} color={DEBT_STATUS_COLORS[d.status]} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="action-btn" onClick={() => setPayTarget(d)} title={isReceivable ? "Thu tiền" : "Thanh toán"} style={{ background: "#f6ffed" }}>💰</button>
                      <button className="action-btn" onClick={() => setEditTarget(d)} title="Sửa hạn">📅</button>
                      <button className="action-btn" onClick={() => setHistoryTarget(d)} title="Lịch sử">📜</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {payTarget && <PayModal debt={payTarget} onClose={() => setPayTarget(null)} onPay={handlePay} />}
      {editTarget && <EditScheduleModal debt={editTarget} onClose={() => setEditTarget(null)} onSave={handleSaveSchedule} />}
      {historyTarget && <HistoryModal debt={historyTarget} onClose={() => setHistoryTarget(null)} />}
    </div>
  );
}
