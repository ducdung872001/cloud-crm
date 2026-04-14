/**
 * DebtManagementListV2 — Service-layer demo
 *
 * Trang này MINH HỌA pattern async-service thay vì import MOCK trực tiếp.
 * Khi BE sẵn sàng, chỉ cần set VITE_TNPM_API_URL và service sẽ tự chuyển
 * từ mock → real API mà không cần đổi 1 dòng code nào trong page này.
 *
 * Khác với DebtManagementList.tsx ban đầu:
 *  - useState khởi tạo = [] (rỗng) thay vì MOCK_DEBTS
 *  - useEffect call DebtService.list() để load data
 *  - Loading state + error state
 *  - Refetch sau khi save/pay (invalidate cache)
 *  - Filter đi qua service query params thay vì client-side filter
 */

import React, { useEffect, useState, useCallback } from "react";
import DebtService, { IDebt, IDebtFilter } from "services/tnpm/DebtService";
import { MOCK_PAYMENT_METHODS, MOCK_FUNDS, MOCK_PROJECTS } from "assets/mock/TNPMData";
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

function getDaysLabel(daysRemaining: number) {
  if (daysRemaining < 0) return { text: `Quá ${Math.abs(daysRemaining)} ngày`, color: "#ff4d4f" };
  if (daysRemaining === 0) return { text: "Hôm nay", color: "#faad14" };
  if (daysRemaining <= 10) return { text: `Còn ${daysRemaining} ngày`, color: "#faad14" };
  return { text: `Còn ${daysRemaining} ngày`, color: "#52c41a" };
}

// ─── Pay Modal (async service call) ──────────────────────────────────────
function PayModal({ debt, onClose, onSuccess }: any) {
  const [amount, setAmount] = useState(debt.amount);
  const [methodId, setMethodId] = useState(MOCK_PAYMENT_METHODS.find((m: any) => m.enabled)?.id || 1);
  const [fundId, setFundId] = useState(MOCK_FUNDS[0]?.id || 1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (amount <= 0) return setError("Số tiền phải lớn hơn 0");
    if (amount > debt.amount) return setError(`Số tiền vượt quá nợ còn lại (${fmtMoney(debt.amount)})`);

    setError(null);
    setSubmitting(true);
    try {
      const result = await DebtService.pay(debt.id, {
        amount,
        methodId,
        fundId,
        note,
        transDate: new Date().toISOString().split("T")[0],
      });
      onSuccess(result);
    } catch (e: any) {
      setError(e?.message || "Có lỗi xảy ra khi ghi nhận thanh toán");
    } finally {
      setSubmitting(false);
    }
  };

  const isReceivable = debt.kind === "receivable";

  return (
    <ModalShell
      title={isReceivable ? "💰 Thu nợ khách hàng" : "💸 Thanh toán cho NCC"}
      onClose={onClose}
      maxWidth={560}
      footer={<>
        <button className="btn btn-outline" onClick={onClose} disabled={submitting}>Hủy</button>
        <button className="btn btn-primary" onClick={handlePay} disabled={submitting}>
          {submitting ? "⏳ Đang xử lý..." : `✓ Xác nhận ${isReceivable ? "thu tiền" : "thanh toán"}`}
        </button>
      </>}
    >
      <div style={{ background: "#f5f7fa", borderRadius: 8, padding: 14, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: "#8c8c8c", fontSize: 13 }}>Đối tượng</span>
          <strong>{debt.counterpartyName}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: "#8c8c8c", fontSize: 13 }}>Hóa đơn</span>
          <span className="code-text">{debt.refCode}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#8c8c8c", fontSize: 13 }}>Còn nợ</span>
          <strong style={{ color: "#ff4d4f", fontSize: 18 }}>{fmtMoney(debt.amount)}</strong>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Số tiền</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="form-control" type="number" value={amount} onChange={(e) => setAmount(+e.target.value || 0)} />
            <button type="button" className="btn btn-outline" onClick={() => setAmount(debt.amount)}>Thu đủ</button>
          </div>
          <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{fmtMoney(amount)}</div>
        </div>
        <div className="form-group">
          <label>Phương thức TT</label>
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
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label>Ghi chú</label>
          <input className="form-control" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 10, background: "#fff1f0", borderRadius: 6, color: "#ff4d4f", fontSize: 13 }}>
          ✗ {error}
        </div>
      )}
    </ModalShell>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function DebtManagementListV2() {
  document.title = "Quản lý Công nợ V2 (service layer) – TNPM";

  const [debts, setDebts] = useState<IDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterKind, setFilterKind] = useState<"all" | "receivable" | "payable">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "overdue" | "upcoming" | "open">("all");
  const [filterProject, setFilterProject] = useState<string>("");
  const [search, setSearch] = useState("");
  const [payTarget, setPayTarget] = useState<any>(null);

  // Fetch debts from service (with debounced search)
  const fetchDebts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filter: IDebtFilter = {};
      if (filterKind !== "all") filter.kind = filterKind;
      if (filterStatus !== "all") filter.status = filterStatus;
      if (filterProject) filter.projectId = filterProject;
      if (search) filter.keyword = search;

      const res = await DebtService.list(filter);
      setDebts(res.items);
    } catch (e: any) {
      setError(e?.message || "Không tải được danh sách công nợ");
    } finally {
      setLoading(false);
    }
  }, [filterKind, filterStatus, filterProject, search]);

  useEffect(() => {
    // Debounce search-triggered refetches
    const timer = setTimeout(fetchDebts, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchDebts, search]);

  const handlePaySuccess = async (result: { debtId: number; remaining: number }) => {
    setPayTarget(null);
    alert(`✓ Thanh toán thành công. Còn lại: ${fmtMoney(result.remaining)}`);
    // Re-fetch to sync state
    await fetchDebts();
  };

  // KPI computed from fetched data
  const totalReceivable = debts
    .filter((d) => d.kind === "receivable" && d.status !== "paid")
    .reduce((a, d) => a + d.amount, 0);
  const totalPayable = debts
    .filter((d) => d.kind === "payable" && d.status !== "paid")
    .reduce((a, d) => a + d.amount, 0);
  const overdueCount = debts.filter((d) => d.status === "overdue").length;
  const counterpartyCount = new Set(debts.map((d) => d.counterpartyName)).size;

  return (
    <div className="tnpm-list-page">
      <PageHeader
        title="💼 Quản lý Công nợ (V2 — service layer)"
        subtitle="Prototype minh họa async service pattern — swap mock ↔ real API không cần đổi page code"
        actions={<>
          <button className="btn btn-outline" onClick={() => DebtService.exportExcel().catch(() => {})}>📊 Xuất Excel</button>
          <button className="btn btn-primary" onClick={fetchDebts}>🔄 Refresh</button>
        </>}
      />

      {/* Status banner */}
      <div style={{
        padding: 10, borderRadius: 6, marginBottom: 14, fontSize: 12,
        background: error ? "#fff1f0" : "#e6f7ff",
        color: error ? "#ff4d4f" : "#1890ff",
      }}>
        {loading && <>⏳ Đang tải dữ liệu từ service layer...</>}
        {!loading && !error && (
          <>✅ Đã load {debts.length} công nợ qua <code>DebtService.list()</code>. Mode: {(import.meta as any).env?.VITE_TNPM_USE_MOCK === "1" || !(import.meta as any).env?.VITE_TNPM_API_URL ? <strong>MOCK (fallback)</strong> : <strong>REAL API</strong>}.</>
        )}
        {error && <>✗ Lỗi: {error}</>}
      </div>

      <KpiRow columns={4} items={[
        { label: "Tổng phải thu", value: fmtMoney(totalReceivable), color: "#52c41a", icon: "📥" },
        { label: "Tổng phải trả", value: fmtMoney(totalPayable), color: "#ff4d4f", icon: "📤" },
        { label: "Công nợ quá hạn", value: `${overdueCount}`, color: "#faad14", icon: "⚠️" },
        { label: "Số đối tượng", value: `${counterpartyCount}`, color: "#1890ff", icon: "👥" },
      ]} />

      <TabBar
        tabs={[
          { key: "all", label: "Tất cả", count: debts.length },
          { key: "receivable", label: "Phải thu", count: debts.filter((d) => d.kind === "receivable").length },
          { key: "payable", label: "Phải trả", count: debts.filter((d) => d.kind === "payable").length },
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
              <th>Loại</th>
              <th>Dự án</th>
              <th>Hóa đơn</th>
              <th>Còn lại</th>
              <th>Hạn TT</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && debts.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>⏳ Đang tải...</td></tr>
            )}
            {!loading && debts.length === 0 && !error && (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có công nợ nào.</td></tr>
            )}
            {debts.map((d) => {
              const days = getDaysLabel(d.daysRemaining);
              const isReceivable = d.kind === "receivable";
              return (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500 }}>
                    <div>{d.counterpartyName}</div>
                    <div style={{ fontSize: 11, color: "#8c8c8c" }}>{d.counterpartyType === "customer" ? "Khách hàng" : "Nhà cung cấp"}</div>
                  </td>
                  <td>
                    <StatusBadge
                      label={isReceivable ? "Phải thu" : "Phải trả"}
                      color={isReceivable ? "#1890ff" : "#ff4d4f"}
                    />
                  </td>
                  <td style={{ fontSize: 12 }}>{d.projectName}</td>
                  <td><span className="code-text">{d.refCode}</span></td>
                  <td className="amount-text" style={{ color: "#ff4d4f", fontWeight: 600 }}>{fmtMoney(d.amount)}</td>
                  <td style={{ fontSize: 12 }}>{d.dueDate}</td>
                  <td style={{ fontSize: 12, color: days.color, fontWeight: 500 }}>{days.text}</td>
                  <td>
                    <StatusBadge label={DEBT_STATUS_LABELS[d.status]} color={DEBT_STATUS_COLORS[d.status]} />
                  </td>
                  <td>
                    <button className="action-btn" onClick={() => setPayTarget(d)} title={isReceivable ? "Thu tiền" : "Thanh toán"} style={{ background: "#f6ffed" }}>💰</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {payTarget && <PayModal debt={payTarget} onClose={() => setPayTarget(null)} onSuccess={handlePaySuccess} />}
    </div>
  );
}
