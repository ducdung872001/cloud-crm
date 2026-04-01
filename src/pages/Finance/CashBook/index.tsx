/**
 * Sổ thu chi — v2
 *
 * Layout: 2 cột (giống màn hình Quản lý quỹ)
 *   - Trái  : danh sách giao dịch group theo ngày + bộ lọc
 *   - Phải  : thống kê + nút tạo phiếu nhanh (slide-over)
 *
 * API sử dụng:
 *   GET  {cashbook.list}    — danh sách giao dịch (infinite scroll)
 *   GET  {billing}/fund/overview  — dropdown quỹ cho form
 *   GET  {category.list}   — dropdown khoản mục cho form
 *   POST {cashbook.update} — tạo phiếu thu / chi mới
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { urlsApi } from "configs/urls";
import CashbookService from "services/CashbookService";
import { toApiDateFormat } from "utils/common";
import {
  CashbookSlideOver,
  FinanceBadge,
  FinanceEmptyState,
  FinanceLoadMoreIndicator,
  FinancePageShell,
  FinanceStatCard,
  formatCurrency,
  formatDate,
  useFinanceProgressiveList,
  useFinanceToast,
} from "../shared";
import "./index.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TxItem {
  id:             number;
  code:           string;
  note:           string;
  amount:         number;
  type:           number;       // 1 = thu, 2 = chi
  categoryName:   string;
  empName:        string;
  branchName?:    string;
  fundName?:      string;
  transDate:      string;
  approvalStatus?: string;      // approved | pending | rejected (tuỳ backend trả về)
}

interface FundItem {
  id:      number;
  name:    string;
  balance: number;
  type?:   string;
  typeLabel?: string;
}

interface CategoryItem {
  id:   number;
  name: string;
  type: number; // 1=thu, 2=chi
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Lấy URL fund overview từ billing prefix */
const fundOverviewUrl = () =>
  (urlsApi.financeDashboard as any).full.replace("/finance/dashboard", "/fund/overview");

/** Group danh sách giao dịch theo ngày (key = YYYY-MM-DD) */
function groupByDate(items: TxItem[]): Record<string, TxItem[]> {
  return items.reduce((acc, item) => {
    const key = (item.transDate ?? "").slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, TxItem[]>);
}

// ─── Approval badge helper ────────────────────────────────────────────────────

function approvalBadge(status?: string) {
  if (status === "approved")
    return <FinanceBadge tone="success">Đã duyệt</FinanceBadge>;
  if (status === "rejected")
    return <FinanceBadge tone="danger">Từ chối</FinanceBadge>;
  return <FinanceBadge tone="warning">Chờ duyệt</FinanceBadge>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FinanceCashBook() {
  document.title = "Sổ thu chi";

  // ── State: danh sách giao dịch ───────────────────────────────────────────
  const [allTxns, setAllTxns]         = useState<TxItem[]>([]);
  const [txLoading, setTxLoading]     = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // ── Bộ lọc ──────────────────────────────────────────────────────────────
  const [kindFilter, setKindFilter]   = useState<"all" | "1" | "2">("all");
  const [monthFilter, setMonthFilter] = useState<"this_month" | "all">("this_month");
  const [fundFilter, setFundFilter]   = useState("all");
  const [filterFunds, setFilterFunds] = useState<FundItem[]>([]);

  // ── Slide-over tạo phiếu ─────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [exporting, setExporting]   = useState(false);

  const { toast, ToastNode } = useFinanceToast();
  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch danh sách giao dịch ────────────────────────────────────────────
  const fetchTransactions = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTxLoading(true);

    const now  = new Date();
    const params: Record<string, any> = { page: 1, limit: 200 };

    if (monthFilter === "this_month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      params.fromTime = toApiDateFormat(firstDay.toISOString());
      params.toTime   = toApiDateFormat(lastDay.toISOString());
    }

    if (kindFilter !== "all") params.type = Number(kindFilter);

    CashbookService.list(params, ctrl.signal)
      .then((res: any) => {
        const raw: TxItem[] = res?.result?.cashbookResponse?.items ?? [];
        const filteredByFund = fundFilter === "all"
          ? raw
          : raw.filter((t: any) => String(t.fundName) === fundFilter);

        setAllTxns(filteredByFund);

        let inc = 0, exp = 0;
        filteredByFund.forEach((t) => {
          if (t.type === 1) inc += t.amount;
          else              exp += t.amount;
        });
        setTotalIncome(inc);
        setTotalExpense(exp);
      })
      .catch((err: any) => {
        if (err?.name !== "AbortError") console.error("[CashBook]", err);
      })
      .finally(() => setTxLoading(false));
  }, [kindFilter, monthFilter, fundFilter]);

  // Fetch khi filter thay đổi
  useEffect(() => {
    fetchTransactions();
    return () => abortRef.current?.abort();
  }, [fetchTransactions]);

  // ── Fetch fund cho bộ lọc (1 lần) ───────────────────────────────────────
  useEffect(() => {
    fetch(fundOverviewUrl())
      .then(r => r.json())
      .then((res: any) => {
        const raw = res?.data?.funds ?? [];
        setFilterFunds(
          raw.map((f: any) => ({
            id:      Number(f.id),
            name:    String(f.name ?? ""),
            balance: Number(f.balance ?? 0),
            typeLabel: f.typeLabel,
          }))
        );
      })
      .catch(() => {/* silent */});
  }, []);

  // ── Progressive list ─────────────────────────────────────────────────────
  const {
    visibleItems: visibleTxns,
    isLoading:    scrollLoading,
    hasMore,
    handleScroll,
  } = useFinanceProgressiveList(allTxns, 15);

  const grouped = groupByDate(visibleTxns);

  const hasCustomFilter = kindFilter !== "all" || monthFilter !== "this_month" || fundFilter !== "all";
  const resetFilters = () => {
    setKindFilter("all");
    setMonthFilter("this_month");
    setFundFilter("all");
  };

  // ── Xuất Excel ───────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const now = new Date();
      // Tính fromTime/toTime theo filter hiện tại (đúng format dd/MM/yyyy backend yêu cầu)
      const pad = (n: number) => String(n).padStart(2, "0");
      const fmt = (d: Date) =>
        `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

      let fromTime: string | undefined;
      let toTime: string | undefined;
      if (monthFilter === "this_month") {
        fromTime = fmt(new Date(now.getFullYear(), now.getMonth(), 1));
        toTime   = fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0));
      }

      await CashbookService.exportFile({
        fromTime,
        toTime,
        // type: kindFilter !== "all" ? Number(kindFilter) : undefined,
      });
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        toast("Xuất Excel thất bại. Vui lòng thử lại.");
      }
    } finally {
      setExporting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <FinancePageShell title="Sổ thu chi">
      {ToastNode}

      {/* ── Screen header ── */}
      <div className="finance-screen-header">
        <h1>Sổ thu chi</h1>
        <div style={{ display: "flex", gap: "0.8rem" }}>
          <button
            className="finance-action-btn finance-action-btn--outline"
            onClick={handleExportExcel}
            disabled={exporting || allTxns.length === 0}
            title={allTxns.length === 0 ? "Không có dữ liệu để xuất" : "Xuất sổ thu chi ra Excel"}
          >
            {exporting ? "Đang xuất..." : "⬇ Xuất Excel"}
          </button>
          <button
            className="finance-action-btn finance-action-btn--primary"
            onClick={() => setShowCreate(true)}
          >
            + Tạo phiếu thu/chi
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="finance-grid">
        <div className="finance-grid__span-4">
          <FinanceStatCard label="Tổng thu" value={formatCurrency(totalIncome)} tone="success" />
        </div>
        <div className="finance-grid__span-4">
          <FinanceStatCard label="Tổng chi" value={formatCurrency(totalExpense)} tone="danger" />
        </div>
        <div className="finance-grid__span-4">
          <FinanceStatCard
            label="Số dư thực"
            value={formatCurrency(totalIncome - totalExpense)}
            tone="warning"
          />
        </div>
      </div>

      {/* ── Main panel ── */}
      <div className="finance-panel">
        {/* Toolbar */}
        <div className="finance-panel__title">
          <h2>Bộ lọc nhanh</h2>
          <span>
            Đã tải {visibleTxns.length}/{allTxns.length} giao dịch
          </span>
        </div>

        <div className="finance-filter-toolbar">
          {/* Loại */}
          <div className="finance-filter-toolbar__group">
            <select
              value={kindFilter}
              onChange={e => setKindFilter(e.target.value as any)}
              className="finance-filter-select finance-filter-select--compact"
              aria-label="Lọc theo loại"
            >
              <option value="all">Tất cả</option>
              <option value="1">Thu</option>
              <option value="2">Chi</option>
            </select>
          </div>

          {/* Tháng */}
          <div className="finance-filter-toolbar__group">
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value as any)}
              className="finance-filter-select finance-filter-select--compact"
              aria-label="Lọc theo thời gian"
            >
              <option value="this_month">Tháng này</option>
              <option value="all">Tất cả</option>
            </select>
          </div>

          {/* Quỹ */}
          <div className="finance-filter-toolbar__group">
            <select
              value={fundFilter}
              onChange={e => setFundFilter(e.target.value)}
              className="finance-filter-select finance-filter-select--wide"
              aria-label="Lọc theo quỹ"
            >
              <option value="all">Tất cả quỹ</option>
              {filterFunds.map(f => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>

          {hasCustomFilter && (
            <div className="finance-filter-toolbar__group finance-filter-toolbar__group--end">
              <button className="finance-filter-reset" onClick={resetFilters}>
                Đặt lại
              </button>
            </div>
          )}
        </div>

        {/* Transaction list */}
        {txLoading ? (
          <div className="finance-loading-center">
            <span className="finance-spinner" />
          </div>
        ) : (
          <div className="finance-scroll-panel" onScroll={handleScroll}>
            {allTxns.length === 0 ? (
              <FinanceEmptyState
                title="Chưa có giao dịch phù hợp"
                description="Hãy thay đổi bộ lọc hoặc tạo thêm phiếu thu/chi."
              />
            ) : (
              <>
                {Object.keys(grouped).map(dateKey => (
                  <div key={dateKey} className="finance-date-group">
                    <span className="finance-date-group__label">
                      {formatDate(dateKey)}
                    </span>
                    <div className="finance-list">
                      {grouped[dateKey].map(item => (
                        <div key={item.id} className="finance-list__item">
                          <div>
                            <strong>{item.note || item.categoryName}</strong>
                            <div className="finance-list__meta">
                              {item.code ? `${item.code} | ` : ""}
                              {item.categoryName}
                              {item.fundName ? ` | ${item.fundName}` : ""}
                            </div>
                            <div className="finance-list__meta">
                              {item.branchName ? `${item.branchName} | ` : ""}
                              {item.empName}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div
                              className="finance-inline-actions"
                              style={{ justifyContent: "flex-end", gap: "0.5rem" }}
                            >
                              <FinanceBadge tone={item.type === 1 ? "success" : "danger"}>
                                {item.type === 1 ? "Thu" : "Chi"}
                              </FinanceBadge>
                              {approvalBadge(item.approvalStatus)}
                            </div>
                            <div
                              className={
                                item.type === 1
                                  ? "finance-amount--income"
                                  : "finance-amount--expense"
                              }
                              style={{ marginTop: "0.5rem" }}
                            >
                              {item.type === 1 ? "+" : "-"} {formatCurrency(item.amount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <FinanceLoadMoreIndicator loading={scrollLoading} hasMore={hasMore} />
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Slide-over: Tạo phiếu Thu / Chi ── */}
      <CashbookSlideOver
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          toast("✓ Tạo phiếu thành công");
          fetchTransactions();
        }}
      />

          </FinancePageShell>
  );
}