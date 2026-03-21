import React, { useEffect, useRef, useState } from "react";
import urls from "configs/urls";
import { Link } from "react-router-dom";
import {
  getFinanceDebtsMock,
  getFinanceFundsMock,
  getFinanceTransactionsMock,
} from "../data";
import {
  FinanceBadge,
  FinanceLoadMoreIndicator,
  FinancePageShell,
  FinanceStatCard,
  formatCurrency,
  formatDateTime,
  useFinanceProgressiveList,
} from "../shared";
import FinanceDashboardService, {
  getDaysAgoParam,
  getTodayParam,
  IFinanceDashboardResponse,
} from "services/FinanceDashboardService";
import { ICashBookResponse } from "model/cashbook/CashbookResponseModel";
import "./index.scss";

// ── Mock data dùng làm placeholder khi API chưa về ────────────────────────────
const mockFunds      = getFinanceFundsMock();
const mockTxns       = getFinanceTransactionsMock();
const mockDebts      = getFinanceDebtsMock();

const mockTotalFund    = mockFunds.reduce((s, f) => s + f.balance, 0);
const mockTotalIncome  = mockTxns.filter((t) => t.kind === "income").reduce((s, t) => s + t.amount, 0);
const mockTotalExpense = mockTxns.filter((t) => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
const mockReceivable   = mockDebts.filter((d) => d.kind === "receivable" && d.status !== "paid").reduce((s, d) => s + d.amount, 0);
const mockPayable      = mockDebts.filter((d) => d.kind === "payable"    && d.status !== "paid").reduce((s, d) => s + d.amount, 0);
const mockDebtAlerts   = mockDebts.filter((d) => d.status === "overdue" || d.status === "upcoming");

/** Chuyển FinanceTransaction mock → shape giống ICashBookResponse để render cùng 1 template */
function mockTxToApiShape(t: ReturnType<typeof getFinanceTransactionsMock>[0]): ICashBookResponse {
  return {
    id: Number(t.id.replace(/\D/g, "")) || 0,
    note: t.title,
    amount: t.amount,
    type: t.kind === "income" ? 1 : 2,
    transDate: t.createdAt,
    empName: t.createdBy,
    employeeId: 0,
    branchId: 0,
    categoryName: "",
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FinanceDashboard() {
  document.title = "Dashboard tài chính";

  // Khởi tạo ngay bằng mock — UI hiển thị được trước khi API về
  const [data, setData]       = useState<IFinanceDashboardResponse | null>(null);
  const [isMock, setIsMock]   = useState(true);   // true = đang hiển thị mock
  const [error, setError]     = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    FinanceDashboardService.full(
      { branchId: 0, fromTime: getDaysAgoParam(30), toTime: getTodayParam() },
      controller.signal
    )
      .then((res) => {
        setData(res);
        setIsMock(false);
        setError(null);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          // API lỗi → giữ nguyên mock, hiện banner nhỏ
          setError("Không thể tải dữ liệu thực — đang hiển thị dữ liệu mẫu");
        }
      });

    return () => controller.abort();
  }, []);

  // ── Derived values — dùng real data khi có, fallback mock khi chưa ──────────
  const totalFundBalance = isMock ? mockTotalFund    : (data?.totalFundBalance ?? 0);
  const totalIncome      = isMock ? mockTotalIncome  : (data?.totalIncome      ?? 0);
  const totalExpense     = isMock ? mockTotalExpense : (data?.totalExpense     ?? 0);
  const receivable       = isMock ? mockReceivable   : 0;  // billing DB không có
  const payable          = isMock ? mockPayable      : 0;

  // Giao dịch: dùng real khi API về VÀ có dữ liệu, còn lại giữ mock
  const recentTransactions: ICashBookResponse[] =
    !isMock && data?.recentTransactions?.length
      ? data.recentTransactions
      : mockTxns.map(mockTxToApiShape);

  // Cảnh báo công nợ: luôn dùng mock cho đến khi có API cloud-sales
  const debtAlerts = mockDebtAlerts;

  const {
    visibleItems: visibleTransactions,
    isLoading: isTransactionsLoading,
    hasMore: hasMoreTransactions,
    handleScroll: handleTransactionsScroll,
  } = useFinanceProgressiveList(recentTransactions, 10);

  const {
    visibleItems: visibleDebtAlerts,
    isLoading: isDebtAlertsLoading,
    hasMore: hasMoreDebtAlerts,
    handleScroll: handleDebtAlertsScroll,
  } = useFinanceProgressiveList(debtAlerts, 10);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <FinancePageShell
      title="Dashboard tài chính"
      actions={
        <div className="finance-inline-actions">
          <Link
            className="finance-link-button finance-link-button--primary"
            to={urls.finance_management_cashbook_template}
          >
            Tạo phiếu
          </Link>
          <Link className="finance-link-button" to={urls.finance_management_cashbook}>
            Xem sổ thu chi
          </Link>
        </div>
      }
    >
      {error && (
        <div className="finance-error-banner">{error}</div>
      )}

      <div className="finance-grid">
        {/* ── KPI Cards ── */}
        <div className="finance-grid__span-3">
          <FinanceStatCard
            label="Tổng quỹ hiện tại"
            value={formatCurrency(totalFundBalance)}
            helper="Tổng số dư toàn hệ thống"
            tone="success"
          />
        </div>
        <div className="finance-grid__span-3">
          <FinanceStatCard
            label="Tổng thu"
            value={formatCurrency(totalIncome)}
            helper="Tổng từ các phiếu thu"
            tone="success"
          />
        </div>
        <div className="finance-grid__span-3">
          <FinanceStatCard
            label="Tổng chi"
            value={formatCurrency(totalExpense)}
            helper="Trừ từ các phiếu chi"
            tone="danger"
          />
        </div>
        <div className="finance-grid__span-3">
          <FinanceStatCard
            label="Công nợ mở"
            value={formatCurrency(receivable + payable)}
            helper={`Phải thu ${formatCurrency(receivable)} | Phải trả ${formatCurrency(payable)}`}
            tone="warning"
          />
        </div>

        {/* ── Giao dịch gần nhất ── */}
        <div className="finance-grid__span-7">
          <section className="finance-panel">
            <div className="finance-panel__title">
              <h2>Giao dịch gần nhất</h2>
              <Link className="finance-link-button" to={urls.finance_management_cashbook}>
                Xem toàn bộ sổ thu chi
              </Link>
            </div>
            <div className="finance-scroll-panel" onScroll={handleTransactionsScroll}>
              <div className="finance-list">
                {visibleTransactions.map((item) => {
                  const isIncome = item.type === 1;
                  return (
                    <div key={item.id} className="finance-list__item">
                      <div>
                        <strong>{item.note || item.billCode || "—"}</strong>
                        <div className="finance-list__meta">
                          {formatDateTime(item.transDate)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <FinanceBadge tone={isIncome ? "success" : "danger"}>
                          {isIncome ? "Thu tiền" : "Chi tiền"}
                        </FinanceBadge>
                        <div
                          className={isIncome ? "finance-amount--income" : "finance-amount--expense"}
                          style={{ marginTop: "0.6rem", fontWeight: 700 }}
                        >
                          {isIncome ? "+" : "-"} {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <FinanceLoadMoreIndicator
                loading={isTransactionsLoading}
                hasMore={hasMoreTransactions}
              />
            </div>
          </section>
        </div>

        {/* ── Cảnh báo công nợ ── */}
        <div className="finance-grid__span-5">
          <section className="finance-panel">
            <div className="finance-panel__title">
              <h2>Cảnh báo công nợ</h2>
              <Link className="finance-link-button" to={urls.finance_management_debt_management}>
                Quản lý công nợ
              </Link>
            </div>
            <div className="finance-scroll-panel" onScroll={handleDebtAlertsScroll}>
              <div className="finance-summary-list">
                {visibleDebtAlerts.map((item) => (
                  <div key={item.id} className="finance-summary-list__item">
                    <div>
                      <strong>{item.name}</strong>
                      <div className="finance-muted">
                        {item.kind === "receivable" ? "Phải thu" : "Phải trả"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <FinanceBadge tone={item.status === "overdue" ? "danger" : "warning"}>
                        {item.status === "overdue" ? "Quá hạn" : "Sắp đến hạn"}
                      </FinanceBadge>
                      <div style={{ marginTop: "0.6rem", fontWeight: 700 }}>
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <FinanceLoadMoreIndicator
                loading={isDebtAlertsLoading}
                hasMore={hasMoreDebtAlerts}
              />
            </div>
          </section>
        </div>
      </div>
    </FinancePageShell>
  );
}