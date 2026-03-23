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
import CategoryService from "services/CategoryService";
import {
  FinanceBadge,
  FinanceEmptyState,
  FinanceLoadMoreIndicator,
  FinancePageShell,
  FinanceSlideOver,
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

interface CreateForm {
  type:          1 | 2;
  categoryId:    string;
  fundId:        string;
  amount:        string;
  relatedEntity: string;
  transDate:     string;
  note:          string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayISO = () => new Date().toISOString().split("T")[0];

const FORM_INIT: CreateForm = {
  type: 1, categoryId: "", fundId: "",
  amount: "", relatedEntity: "",
  transDate: todayISO(), note: "",
};

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
  const [showCreate, setShowCreate]           = useState(false);
  const [form, setForm]                       = useState<CreateForm>(FORM_INIT);
  const [submitting, setSubmitting]           = useState(false);
  const [formError, setFormError]             = useState("");
  const [categories, setCategories]           = useState<CategoryItem[]>([]);
  const [formFunds, setFormFunds]             = useState<FundItem[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

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
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      params.fromTime = `${y}-${m}-01`;
      params.toTime   = `${y}-${m}-${new Date(y, now.getMonth() + 1, 0).getDate()}`;
    }

    if (kindFilter !== "all") params.type = Number(kindFilter);

    CashbookService.list(params, ctrl.signal)
      .then((res: any) => {
        const raw: TxItem[] = res?.data?.content ?? res?.data ?? [];
        const filteredByFund = fundFilter === "all"
          ? raw
          : raw.filter((t: any) => String(t.fundId) === fundFilter);

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

  // ── Load categories + funds khi mở slide-over ────────────────────────────
  useEffect(() => {
    if (!showCreate) return;
    setDropdownLoading(true);

    Promise.allSettled([
      CategoryService.list({ page: 1, limit: 200 } as any),
      fetch(fundOverviewUrl()).then(r => r.json()),
    ]).then(([catRes, fundRes]) => {
      if (catRes.status === "fulfilled") {
        const raw = catRes.value?.data?.content ?? catRes.value?.data ?? [];
        setCategories(
          (Array.isArray(raw) ? raw : []).map((c: any) => ({
            id:   Number(c.id),
            name: String(c.name ?? ""),
            type: Number(c.type ?? 1),
          }))
        );
      }
      if (fundRes.status === "fulfilled") {
        const rawFunds = fundRes.value?.data?.funds ?? [];
        setFormFunds(
          (Array.isArray(rawFunds) ? rawFunds : []).map((f: any) => ({
            id:      Number(f.id),
            name:    String(f.name ?? ""),
            balance: Number(f.balance ?? 0),
          }))
        );
      }
    }).finally(() => setDropdownLoading(false));
  }, [showCreate]);

  // ── Reset form ───────────────────────────────────────────────────────────
  const closeCreate = useCallback(() => {
    setShowCreate(false);
    setForm(FORM_INIT);
    setFormError("");
  }, []);

  // ── Submit tạo phiếu ─────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.categoryId) { setFormError("Vui lòng chọn khoản mục");  return; }
    if (!form.fundId)     { setFormError("Vui lòng chọn quỹ tiền");   return; }
    const amountNum = parseInt(form.amount.replace(/\D/g, ""), 10);
    if (!amountNum || amountNum <= 0) { setFormError("Số tiền phải lớn hơn 0"); return; }

    setSubmitting(true);
    try {
      const catName = categories.find(c => c.id === Number(form.categoryId))?.name ?? "";
      const res = await CashbookService.update({
        type:          form.type,
        categoryId:    Number(form.categoryId),
        categoryName:  catName,
        fundId:        Number(form.fundId),
        amount:        amountNum,
        note:          form.note,
        transDate:     form.transDate,
        relatedEntity: form.relatedEntity,
        empName:       "",
        branchId:      0,
      });

      if (res?.code === 0 || res?.code === 200) {
        toast("✓ Tạo phiếu thành công");
        closeCreate();
        fetchTransactions();   // Reload danh sách
      } else {
        setFormError(res?.message ?? "Tạo phiếu thất bại — vui lòng thử lại");
      }
    } catch {
      setFormError("Lỗi kết nối — vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  }, [form, categories, closeCreate, fetchTransactions]);

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

  // ── Amount format cho input ───────────────────────────────────────────────
  const displayAmount = form.amount
    ? new Intl.NumberFormat("vi-VN").format(parseInt(form.amount, 10))
    : "";

  const filteredCats = categories.filter(c => c.type === form.type);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <FinancePageShell title="Sổ thu chi">
      {ToastNode}

      {/* ── Screen header ── */}
      <div className="finance-screen-header">
        <h1>Sổ thu chi</h1>
        <button
          className="finance-action-btn finance-action-btn--primary"
          onClick={() => setShowCreate(true)}
        >
          + Tạo phiếu thu/chi
        </button>
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
                <option key={f.id} value={String(f.id)}>{f.name}</option>
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
      <FinanceSlideOver
        open={showCreate}
        title={form.type === 1 ? "Tạo phiếu thu" : "Tạo phiếu chi"}
        onClose={closeCreate}
        footer={
          <div className="finance-inline-actions">
            <button
              className="finance-action-btn finance-action-btn--primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Đang lưu…" : "Lưu phiếu"}
            </button>
            <button
              className="finance-action-btn"
              onClick={closeCreate}
              disabled={submitting}
            >
              Hủy
            </button>
          </div>
        }
      >
        {dropdownLoading ? (
          <div className="finance-loading-center">
            <span className="finance-spinner" />
          </div>
        ) : (
          <div className="finance-form">
            {/* Loại phiếu */}
            <div className="finance-form__field">
              <label className="finance-form__label">Loại phiếu *</label>
              <div className="finance-type-toggle">
                <button
                  type="button"
                  className={`finance-type-toggle__btn${form.type === 1 ? " finance-type-toggle__btn--active finance-type-toggle__btn--income" : ""}`}
                  onClick={() => setForm(f => ({ ...f, type: 1, categoryId: "" }))}
                >
                  Thu tiền
                </button>
                <button
                  type="button"
                  className={`finance-type-toggle__btn${form.type === 2 ? " finance-type-toggle__btn--active finance-type-toggle__btn--expense" : ""}`}
                  onClick={() => setForm(f => ({ ...f, type: 2, categoryId: "" }))}
                >
                  Chi tiền
                </button>
              </div>
            </div>

            {/* Khoản mục */}
            <div className="finance-form__field">
              <label className="finance-form__label">Khoản mục *</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="finance-filter-select finance-filter-select--full"
              >
                <option value="">-- Chọn khoản mục --</option>
                {filteredCats.map(c => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Quỹ tiền */}
            <div className="finance-form__field">
              <label className="finance-form__label">Quỹ tiền *</label>
              <select
                value={form.fundId}
                onChange={e => setForm(f => ({ ...f, fundId: e.target.value }))}
                className="finance-filter-select finance-filter-select--full"
              >
                <option value="">-- Chọn quỹ --</option>
                {formFunds.map(fund => (
                  <option key={fund.id} value={String(fund.id)}>
                    {fund.name} ({formatCurrency(fund.balance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Số tiền */}
            <div className="finance-form__field">
              <label className="finance-form__label">Số tiền *</label>
              <div className="finance-amount-input-wrap">
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayAmount}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setForm(f => ({ ...f, amount: digits }));
                  }}
                  placeholder="0"
                  className="finance-text-input"
                />
                <span className="finance-amount-input-suffix">VND</span>
              </div>
            </div>

            {/* Ngày giao dịch */}
            <div className="finance-form__field">
              <label className="finance-form__label">Ngày giao dịch</label>
              <input
                type="date"
                value={form.transDate}
                onChange={e => setForm(f => ({ ...f, transDate: e.target.value }))}
                className="finance-text-input"
              />
            </div>

            {/* Đối tượng liên quan */}
            <div className="finance-form__field">
              <label className="finance-form__label">Đối tượng liên quan</label>
              <input
                type="text"
                value={form.relatedEntity}
                onChange={e => setForm(f => ({ ...f, relatedEntity: e.target.value }))}
                placeholder="Tên khách hàng / nhà cung cấp..."
                className="finance-text-input"
              />
            </div>

            {/* Ghi chú */}
            <div className="finance-form__field">
              <label className="finance-form__label">Ghi chú</label>
              <textarea
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Nội dung phiếu..."
                rows={3}
                className="finance-text-input finance-text-input--textarea"
              />
            </div>

            {/* Error */}
            {formError && (
              <div className="finance-form__error">{formError}</div>
            )}
          </div>
        )}
      </FinanceSlideOver>
    </FinancePageShell>
  );
}