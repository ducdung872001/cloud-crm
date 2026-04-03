import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import urls from "configs/urls";
import FinanceDashboardService, {
  getDaysAgoParam,
  getTodayParam,
  type IChartPoint,
  type IFinanceDashboardResponse,
} from "services/FinanceDashboardService";
import {
  CashbookSlideOver,
  FinanceBadge,
  FinanceLoadMoreIndicator,
  FinanceMiniBarChart,
  FinancePageShell,
  FinanceStatCard,
  formatCurrency,
  formatDateTime,
  useFinanceProgressiveList,
} from "../shared";
import DebtManagementService, { IDebtItem } from "services/DebtManagementService";
import "./index.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardState {
  totalFundBalance: number;
  totalIncome:      number;
  totalExpense:     number;
  transactions:     IFinanceDashboardResponse["recentTransactions"];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FinanceDashboard() {
  document.title = "Dashboard tài chính";

  // ── Dashboard data ──────────────────────────────────────────────────────────
  const [loading, setLoading]         = useState(true);
  const [dashboard, setDashboard]     = useState<DashboardState>({
    totalFundBalance: 0, totalIncome: 0, totalExpense: 0, transactions: [],
  });
  const [incomeChart, setIncomeChart]   = useState<IChartPoint[]>([]);
  const [expenseChart, setExpenseChart] = useState<IChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // ── Debt alerts (from API) ──────────────────────────────────────────────────
  const [debtAlerts, setDebtAlerts] = useState<IDebtItem[]>([]);

  useEffect(() => {
    DebtManagementService.list({ kind: "overdue", size: 50 })
      .then((res) => {
        // Lấy tất cả overdue + upcoming
        const alerts = (res.items ?? []).filter(
          (d) => d.status === "overdue" || d.status === "upcoming"
        );
        setDebtAlerts(alerts);
      })
      .catch(() => {});
  }, []);

  // ── Slide-over create form ──────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch dashboard + chart ─────────────────────────────────────────────────
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const params = {
      branchId: 0,
      fromTime: getDaysAgoParam(30),
      toTime:   getTodayParam(),
    };

    setLoading(true);
    setChartLoading(true);

    // KPI + giao dịch gần nhất
    FinanceDashboardService.full(params, ctrl.signal)
      .then(data => {
        setDashboard({
          totalFundBalance: data.totalFundBalance ?? 0,
          totalIncome:      data.totalIncome      ?? 0,
          totalExpense:     data.totalExpense      ?? 0,
          transactions:     data.recentTransactions ?? [],
        });
      })
      .catch(err => { if (err.name !== "AbortError") console.error("[Dashboard]", err); })
      .finally(() => setLoading(false));

    // Biểu đồ thu/chi — không block UI chính
    FinanceDashboardService.chart(params, ctrl.signal)
      .then(data => {
        setIncomeChart(data.incomeChart   ?? []);
        setExpenseChart(data.expenseChart ?? []);
      })
      .catch(err => { if (err.name !== "AbortError") console.warn("[Chart]", err); })
      .finally(() => setChartLoading(false));

    return () => ctrl.abort();
  }, []);

  // ── Progressive list ───────────────────────────────────────────────────────
  const {
    visibleItems: visibleTxns,
    handleScroll: onTxnScroll,
    hasMore: txnHasMore,
    isLoading: txnLoading,
  } = useFinanceProgressiveList(dashboard.transactions, 10);

  const {
    visibleItems: visibleDebts,
    handleScroll: onDebtScroll,
    hasMore: debtHasMore,
    isLoading: debtLoading,
  } = useFinanceProgressiveList(debtAlerts, 10);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <FinancePageShell title="Dashboard tài chính">

      {/* ── Screen header ── */}
      <div className="finance-screen-header">
        <h1>Dashboard tài chính</h1>
        <div className="finance-inline-actions">
          <button
            className="finance-action-btn finance-action-btn--primary"
            onClick={() => setShowCreate(true)}
          >
            + Tạo phiếu nhanh
          </button>
          <Link className="finance-action-btn finance-action-btn--outline" to={urls.finance_management_cashbook}>
            Xem sổ thu chi
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="finance-loading-center">
          <span className="finance-spinner" />
        </div>
      ) : (
        <div className="finance-grid">

          {/* ── KPI Cards ── */}
          <div className="finance-grid__span-3">
            <FinanceStatCard
              label="Tổng quỹ hiện tại"
              value={formatCurrency(dashboard.totalFundBalance)}
              helper="Tổng số dư toàn hệ thống"
              tone="success"
            />
          </div>
          <div className="finance-grid__span-3">
            <FinanceStatCard
              label="Tổng thu (30 ngày)"
              value={formatCurrency(dashboard.totalIncome)}
              helper="Tổng từ các phiếu thu"
              tone="success"
            />
          </div>
          <div className="finance-grid__span-3">
            <FinanceStatCard
              label="Tổng chi (30 ngày)"
              value={formatCurrency(dashboard.totalExpense)}
              helper="Trừ từ các phiếu chi"
              tone="danger"
            />
          </div>
          <div className="finance-grid__span-3">
            <FinanceStatCard
              label="Số dư ròng"
              value={formatCurrency(dashboard.totalIncome - dashboard.totalExpense)}
              helper="Thu trừ chi trong kỳ"
              tone={(dashboard.totalIncome - dashboard.totalExpense) >= 0 ? "success" : "danger"}
            />
          </div>

          {/* ── Chart 30 ngày ── */}
          <div className="finance-grid__span-12">
            <section className="finance-panel finance-chart-panel">
              <div className="finance-panel__title">
                <h2>Thu chi 30 ngày gần nhất</h2>
                <span>{getDaysAgoParam(30)} – {getTodayParam()}</span>
              </div>
              {chartLoading ? (
                <div className="finance-loading-center" style={{ minHeight: "14rem" }}>
                  <span className="finance-spinner" />
                </div>
              ) : (incomeChart.length > 0 || expenseChart.length > 0) ? (
                <FinanceMiniBarChart
                  incomeData={incomeChart}
                  expenseData={expenseChart}
                />
              ) : (
                <div style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#6f8494",
                  fontSize: "1.3rem",
                  background: "#f8fbfd",
                  borderRadius: "1rem",
                }}>
                  Chưa có dữ liệu biểu đồ trong kỳ này
                </div>
              )}
            </section>
          </div>

          {/* ── Giao dịch gần nhất ── */}
          <div className="finance-grid__span-7">
            <section className="finance-panel">
              <div className="finance-panel__title">
                <h2>Giao dịch gần nhất</h2>
                <Link className="finance-panel-link" to={urls.finance_management_cashbook}>
                  Xem toàn bộ sổ thu chi →
                </Link>
              </div>
              <div className="finance-scroll-panel" onScroll={onTxnScroll}>
                <div className="finance-list">
                  {visibleTxns.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2.4rem", color: "#6f8494", fontSize: "1.3rem" }}>
                      Chưa có giao dịch nào
                    </div>
                  ) : visibleTxns.map(item => {
                    const isIncome = item.type === 1;
                    return (
                      <div key={item.id} className="finance-list__item">
                        <div>
                          <strong>{item.note || item.billCode || "—"}</strong>
                          <div className="finance-list__meta">
                            {formatDateTime(item.transDate)}
                            {item.billCode ? ` · ${item.billCode}` : ""}
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
                <FinanceLoadMoreIndicator loading={txnLoading} hasMore={txnHasMore} />
              </div>
            </section>
          </div>

          {/* ── Cảnh báo công nợ ── */}
          <div className="finance-grid__span-5">
            <section className="finance-panel">
              <div className="finance-panel__title">
                <h2>Cảnh báo công nợ</h2>
                <Link className="finance-panel-link" to={urls.finance_management_debt_management}>
                  Quản lý →
                </Link>
              </div>
              <div className="finance-scroll-panel" onScroll={onDebtScroll}>
                <div className="finance-summary-list">
                  {visibleDebts.map(item => (
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
                <FinanceLoadMoreIndicator loading={debtLoading} hasMore={debtHasMore} />
              </div>
            </section>
          </div>

        </div>
      )}

      {/* ═══ Slide-over: Tạo phiếu nhanh ═══ */}
      <CashbookSlideOver
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => setShowCreate(false)}
      />
    </FinancePageShell>
  );
}