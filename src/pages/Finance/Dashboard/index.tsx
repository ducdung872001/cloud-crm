import React, { useEffect, useRef, useState } from "react";
import urls from "configs/urls";
import { Link } from "react-router-dom";
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

export default function FinanceDashboard() {
  document.title = "Dashboard tài chính";

  // ── State ──────────────────────────────────────────────────────────────────
  const [data, setData] = useState<IFinanceDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Hủy request cũ nếu re-mount
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    FinanceDashboardService.full(
      {
        branchId: 0,
        fromTime: getDaysAgoParam(30), // 30 ngày trước — giống pattern filter ở CashBook
        toTime: getTodayParam(),
      },
      controller.signal
    )
      .then((res) => {
        setData(res);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          setError(err.message ?? "Không thể tải dữ liệu");
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────

  // KPI cards — fallback 0 khi đang loading
  const totalFundBalance = data?.totalFundBalance ?? 0;
  const totalIncome = data?.totalIncome ?? 0;
  const totalExpense = data?.totalExpense ?? 0;

  // Giao dịch gần nhất — API đã trả về đúng 10 bản ghi, dùng progressive list
  // để giữ UX scroll giống các panel khác
  const recentTransactions: ICashBookResponse[] = data?.recentTransactions ?? [];

  const {
    visibleItems: visibleTransactions,
    isLoading: isTransactionsLoading,
    hasMore: hasMoreTransactions,
    handleScroll: handleTransactionsScroll,
  } = useFinanceProgressiveList(recentTransactions, 10);

  // Cảnh báo công nợ — chưa có API từ cloud-sales, giữ mảng rỗng
  const {
    visibleItems: visibleDebtAlerts,
    isLoading: isDebtAlertsLoading,
    hasMore: hasMoreDebtAlerts,
    handleScroll: handleDebtAlertsScroll,
  } = useFinanceProgressiveList([] as any[], 10);

  // ── Render ─────────────────────────────────────────────────────────────────
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
      {/* Lỗi load */}
      {error && (
        <div className="finance-error-banner">
          Không thể tải dữ liệu: {error}
        </div>
      )}

      <div className="finance-grid">
        {/* ── KPI Cards ── */}
        <div className="finance-grid__span-3">
          <FinanceStatCard
            label="Tổng quỹ hiện tại"
            value={loading ? "..." : formatCurrency(totalFundBalance)}
            helper="Tổng số dư toàn hệ thống"
            tone="success"
          />
        </div>
        <div className="finance-grid__span-3">
          <FinanceStatCard
            label="Tổng thu"
            value={loading ? "..." : formatCurrency(totalIncome)}
            helper="Tổng từ các phiếu thu"
            tone="success"
          />
        </div>
        <div className="finance-grid__span-3">
          <FinanceStatCard
            label="Tổng chi"
            value={loading ? "..." : formatCurrency(totalExpense)}
            helper="Trừ từ các phiếu chi"
            tone="danger"
          />
        </div>
        <div className="finance-grid__span-3">
          {/* Công nợ mở: billing DB không có bảng invoice.
              Giữ nguyên card UI, hiển thị "—" cho đến khi có API cloud-sales */}
          <FinanceStatCard
            label="Công nợ mở"
            value="—"
            helper="Dữ liệu từ module Bán hàng"
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
                {loading
                  ? // Skeleton rows
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="finance-list__item finance-list__item--skeleton">
                        <div className="finance-skeleton finance-skeleton--title" />
                        <div className="finance-skeleton finance-skeleton--meta" />
                      </div>
                    ))
                  : visibleTransactions.length === 0
                  ? <p className="finance-muted" style={{ padding: "1rem 0" }}>Chưa có giao dịch nào</p>
                  : visibleTransactions.map((item) => {
                      const isIncome = item.type === 1;
                      return (
                        <div key={item.id} className="finance-list__item">
                          <div>
                            {/* note là nội dung chính của cashbook */}
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
                              className={
                                isIncome ? "finance-amount--income" : "finance-amount--expense"
                              }
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
              <Link
                className="finance-link-button"
                to={urls.finance_management_debt_management}
              >
                Quản lý công nợ
              </Link>
            </div>
            <div className="finance-scroll-panel" onScroll={handleDebtAlertsScroll}>
              <div className="finance-summary-list">
                {visibleDebtAlerts.length === 0 && !isDebtAlertsLoading ? (
                  <p className="finance-muted" style={{ padding: "1rem 0" }}>
                    Chưa có dữ liệu cảnh báo
                  </p>
                ) : (
                  visibleDebtAlerts.map((item: any) => (
                    <div key={item.id} className="finance-summary-list__item">
                      <div>
                        <strong>{item.name}</strong>
                        <div className="finance-muted">
                          {item.kind === "receivable" ? "Phải thu" : "Phải trả"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <FinanceBadge
                          tone={item.status === "overdue" ? "danger" : "warning"}
                        >
                          {item.status === "overdue" ? "Quá hạn" : "Sắp đến hạn"}
                        </FinanceBadge>
                        <div style={{ marginTop: "0.6rem", fontWeight: 700 }}>
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
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