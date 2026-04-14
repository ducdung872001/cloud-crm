import React, { useState, useMemo } from "react";
import {
  MOCK_DEBT_TRANSACTIONS,
  MOCK_DEBTS,
  MOCK_PAYMENT_METHODS,
  MOCK_FUNDS,
} from "assets/mock/TNPMData";
import { PageHeader, KpiRow, TabBar, ModalShell, StatusBadge, fmtMoney } from "components/tnpm";

const TXN_TYPE_LABELS: Record<string, string> = {
  collect_debt: "Thu nợ KH",
  pay_debt: "Trả nợ NCC",
  create_receivable: "Ghi nhận phải thu",
  create_payable: "Ghi nhận phải trả",
};

const TXN_TYPE_COLORS: Record<string, string> = {
  collect_debt: "#52c41a",
  pay_debt: "#ff4d4f",
  create_receivable: "#1890ff",
  create_payable: "#faad14",
};

// ─── Create Transaction Modal ─────────────────────────────────────────────
function CreateTransactionModal({ onClose, onSave }: any) {
  const [type, setType] = useState<"collect_debt" | "pay_debt" | "create_receivable" | "create_payable">("collect_debt");
  const [debtId, setDebtId] = useState<number | "">("");
  const [amount, setAmount] = useState(0);
  const [methodId, setMethodId] = useState(1);
  const [fundId, setFundId] = useState(1);
  const [note, setNote] = useState("");
  const [transDate, setTransDate] = useState(new Date().toISOString().split("T")[0]);
  const [counterpartyName, setCounterpartyName] = useState("");

  const isNew = type === "create_receivable" || type === "create_payable";

  const availableDebts = useMemo(() => {
    if (type === "collect_debt") return MOCK_DEBTS.filter((d: any) => d.kind === "receivable" && d.status !== "paid");
    if (type === "pay_debt") return MOCK_DEBTS.filter((d: any) => d.kind === "payable" && d.status !== "paid");
    return [];
  }, [type]);

  const selectedDebt = availableDebts.find((d: any) => d.id === debtId);

  const handleSave = () => {
    if (!isNew && !debtId) return alert("Vui lòng chọn công nợ");
    if (amount <= 0) return alert("Số tiền phải lớn hơn 0");
    if (isNew && !counterpartyName) return alert("Vui lòng nhập đối tượng");
    if (selectedDebt && amount > selectedDebt.amount) return alert(`Số tiền vượt quá nợ còn lại (${fmtMoney(selectedDebt.amount)})`);

    const method = MOCK_PAYMENT_METHODS.find((m: any) => m.id === methodId);
    const fund = MOCK_FUNDS.find((f: any) => f.id === fundId);

    onSave({
      id: Date.now(),
      code: `TXN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
      type,
      debtId: debtId || null,
      counterpartyName: selectedDebt?.counterpartyName || counterpartyName,
      counterpartyType: type === "pay_debt" || type === "create_payable" ? "vendor" : "customer",
      amount,
      paymentMethod: isNew ? "" : method?.code || "",
      paymentMethodLabel: isNew ? "—" : method?.name || "—",
      fundName: isNew ? "—" : fund?.name || "—",
      transDate,
      note,
      createdBy: "Người dùng hiện tại",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    });
  };

  return (
    <ModalShell
      title="+ Tạo giao dịch công nợ"
      onClose={onClose}
      wide
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Hủy</button>
        <button className="btn btn-primary" onClick={handleSave}>💾 Lưu giao dịch</button>
      </>}
    >
          {/* Type tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[
              { key: "collect_debt", label: "💰 Thu nợ KH", color: "#52c41a" },
              { key: "pay_debt", label: "💸 Trả nợ NCC", color: "#ff4d4f" },
              { key: "create_receivable", label: "📥 Ghi nhận phải thu", color: "#1890ff" },
              { key: "create_payable", label: "📤 Ghi nhận phải trả", color: "#faad14" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => { setType(t.key as any); setDebtId(""); }}
                style={{
                  flex: 1, padding: "12px 14px", borderRadius: 8,
                  border: type === t.key ? `2px solid ${t.color}` : "1px solid #d9d9d9",
                  background: type === t.key ? `${t.color}11` : "#fff",
                  color: type === t.key ? t.color : "#595959",
                  fontWeight: type === t.key ? 600 : 400, cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="form-grid">
            {!isNew && (
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Công nợ liên quan</label>
                <select className="form-control" value={debtId} onChange={(e) => {
                  const id = e.target.value ? +e.target.value : "";
                  setDebtId(id);
                  const d = availableDebts.find((x: any) => x.id === id);
                  if (d) setAmount(d.amount);
                }}>
                  <option value="">-- Chọn công nợ --</option>
                  {availableDebts.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.counterpartyName} — {d.refCode} — còn {fmtMoney(d.amount)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isNew && (
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Đối tượng ({type === "create_receivable" ? "khách hàng" : "nhà cung cấp"})</label>
                <input className="form-control" value={counterpartyName} onChange={(e) => setCounterpartyName(e.target.value)} placeholder="Nhập tên đối tượng..." />
              </div>
            )}

            <div className="form-group">
              <label>Số tiền</label>
              <input className="form-control" type="number" value={amount} onChange={(e) => setAmount(+e.target.value || 0)} />
              <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{fmtMoney(amount)}</div>
            </div>

            <div className="form-group">
              <label>Ngày giao dịch</label>
              <input className="form-control" type="date" value={transDate} onChange={(e) => setTransDate(e.target.value)} />
            </div>

            {!isNew && (
              <>
                <div className="form-group">
                  <label>Phương thức thanh toán</label>
                  <select className="form-control" value={methodId} onChange={(e) => setMethodId(+e.target.value)}>
                    {MOCK_PAYMENT_METHODS.filter((m: any) => m.enabled).map((m: any) => (
                      <option key={m.id} value={m.id}>{m.icon} {m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quỹ nhận/xuất tiền</label>
                  <select className="form-control" value={fundId} onChange={(e) => setFundId(+e.target.value)}>
                    {MOCK_FUNDS.map((f: any) => (
                      <option key={f.id} value={f.id}>{f.name} — {fmtMoney(f.balance)}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Ghi chú</label>
              <textarea className="form-control" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mô tả nội dung giao dịch..." />
            </div>
          </div>
    </ModalShell>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function DebtTransactionList() {
  document.title = "Giao dịch Công nợ – TNPM";

  const [transactions, setTransactions] = useState<any[]>(MOCK_DEBT_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    return transactions.filter((tx: any) => {
      const q = search.toLowerCase();
      if (search && !tx.counterpartyName.toLowerCase().includes(q) && !tx.code.toLowerCase().includes(q)) return false;
      if (filterType !== "all" && tx.type !== filterType) return false;
      return true;
    });
  }, [transactions, search, filterType]);

  const totalCollected = transactions.filter((tx: any) => tx.type === "collect_debt").reduce((a: number, tx: any) => a + tx.amount, 0);
  const totalPaid = transactions.filter((tx: any) => tx.type === "pay_debt").reduce((a: number, tx: any) => a + tx.amount, 0);
  const totalCreated = transactions.filter((tx: any) => tx.type === "create_receivable" || tx.type === "create_payable").reduce((a: number, tx: any) => a + tx.amount, 0);

  const handleSave = (newTx: any) => {
    setTransactions((prev: any) => [newTx, ...prev]);
    setShowModal(false);
  };

  return (
    <div className="tnpm-list-page">
      <PageHeader
        title="📋 Giao dịch Công nợ"
        subtitle="Lịch sử ghi nhận công nợ và thu/chi nợ trên toàn bộ portfolio"
        actions={<>
          <button className="btn btn-outline">📊 Xuất Excel</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tạo giao dịch</button>
        </>}
      />

      <KpiRow columns={4} items={[
        { label: "Đã thu trong kỳ", value: fmtMoney(totalCollected), color: "#52c41a", icon: "📥" },
        { label: "Đã chi trong kỳ", value: fmtMoney(totalPaid), color: "#ff4d4f", icon: "📤" },
        { label: "Nợ ghi nhận mới", value: fmtMoney(totalCreated), color: "#1890ff", icon: "📝" },
        { label: "Tổng giao dịch", value: `${transactions.length}`, color: "#722ed1", icon: "🔢" },
      ]} />

      <TabBar
        tabs={[
          { key: "all", label: "Tất cả", count: transactions.length },
          { key: "collect_debt", label: "Thu nợ", count: transactions.filter((tx: any) => tx.type === "collect_debt").length },
          { key: "pay_debt", label: "Trả nợ", count: transactions.filter((tx: any) => tx.type === "pay_debt").length },
          { key: "create_receivable", label: "Ghi nhận phải thu", count: transactions.filter((tx: any) => tx.type === "create_receivable").length },
        ]}
        active={filterType}
        onChange={setFilterType}
        rightSlot={<input className="search-input" style={{ width: 240 }} placeholder="🔍 Tìm mã GD, đối tượng..." value={search} onChange={(e) => setSearch(e.target.value)} />}
      />

      <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Ngày</th>
              <th>Loại</th>
              <th>Đối tượng</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Quỹ</th>
              <th>Ghi chú</th>
              <th>Người tạo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có giao dịch nào.</td></tr>
            )}
            {filtered.map((tx: any) => {
              const isIncome = tx.type === "collect_debt";
              const isExpense = tx.type === "pay_debt";
              return (
                <tr key={tx.id}>
                  <td><span className="code-text">{tx.code}</span></td>
                  <td style={{ fontSize: 12 }}>{tx.transDate}</td>
                  <td>
                    <StatusBadge label={TXN_TYPE_LABELS[tx.type]} color={TXN_TYPE_COLORS[tx.type]} />
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    <div>{tx.counterpartyName}</div>
                    <div style={{ fontSize: 11, color: "#8c8c8c" }}>{tx.counterpartyType === "customer" ? "Khách hàng" : "Nhà cung cấp"}</div>
                  </td>
                  <td className="amount-text" style={{ color: isIncome ? "#52c41a" : isExpense ? "#ff4d4f" : "#1a1a2e", fontWeight: 600 }}>
                    {isIncome ? "+" : isExpense ? "−" : ""}{fmtMoney(tx.amount)}
                  </td>
                  <td style={{ fontSize: 12 }}>{tx.paymentMethodLabel}</td>
                  <td style={{ fontSize: 12 }}>{tx.fundName}</td>
                  <td style={{ fontSize: 12, color: "#595959", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.note}</td>
                  <td style={{ fontSize: 12 }}>{tx.createdBy}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && <CreateTransactionModal onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
