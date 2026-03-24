import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import urls from "configs/urls";
import { urlsApi } from "configs/urls";
import FinanceDashboardService, {
  getDaysAgoParam,
  getTodayParam,
  type IChartPoint,
  type IFinanceDashboardResponse,
} from "services/FinanceDashboardService";
import CashbookService from "services/CashbookService";
import CategoryService from "services/CategoryService";
import {
  FinanceBadge,
  FinanceLoadMoreIndicator,
  FinanceMiniBarChart,
  FinancePageShell,
  FinanceSlideOver,
  FinanceStatCard,
  formatCurrency,
  formatDateTime,
  useFinanceProgressiveList,
  useFinanceToast,
} from "../shared";
import { getFinanceDebtsMock } from "../data";
import "./index.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardState {
  totalFundBalance: number;
  totalIncome:      number;
  totalExpense:     number;
  transactions:     IFinanceDashboardResponse["recentTransactions"];
}

interface CategoryItem {
  id:   number;
  name: string;
  type: number; // 1 = thu, 2 = chi
}

interface FundItem {
  id:      number;
  name:    string;
  balance: number;
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

const todayISO = () => new Date().toISOString().split("T")[0];

const FORM_INIT: CreateForm = {
  type: 1, categoryId: "", fundId: "",
  amount: "", relatedEntity: "",
  transDate: todayISO(), note: "",
};

// Debt alerts dùng mock cho đến khi cloud-sales có API
const DEBT_ALERTS = getFinanceDebtsMock().filter(
  d => d.status === "overdue" || d.status === "upcoming"
);

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

  // ── Slide-over create form ──────────────────────────────────────────────────
  const [showCreate, setShowCreate]     = useState(false);
  const [form, setForm]                 = useState<CreateForm>(FORM_INIT);
  const [submitting, setSubmitting]     = useState(false);
  const [formError, setFormError]       = useState("");
  const [categories, setCategories]     = useState<CategoryItem[]>([]);
  const [funds, setFunds]               = useState<FundItem[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  const { toast, ToastNode } = useFinanceToast();
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

  // ── Load categories + funds khi mở slide-over ──────────────────────────────
  useEffect(() => {
    if (!showCreate) return;
    setDropdownLoading(true);

    const fundUrl = (urlsApi.financeDashboard as any).full
      .replace("/finance/dashboard", "/fund/overview");

    Promise.allSettled([
      CategoryService.list({ page: 1, limit: 200 } as any),
      fetch(fundUrl).then(r => r.json()),
    ]).then(([catRes, fundRes]) => {
      if (catRes.status === "fulfilled") {
        const raw = catRes.value?.data?.content
          ?? catRes.value?.data
          ?? [];
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
        setFunds(
          (Array.isArray(rawFunds) ? rawFunds : []).map((f: any) => ({
            id:      Number(f.id),
            name:    String(f.name ?? ""),
            balance: Number(f.balance ?? 0),
          }))
        );
      }
    }).finally(() => setDropdownLoading(false));
  }, [showCreate]);

  // ── Reset form khi đóng slide-over ─────────────────────────────────────────
  const closeCreate = useCallback(() => {
    setShowCreate(false);
    setForm(FORM_INIT);
    setFormError("");
  }, []);

  // ── Submit tạo phiếu ───────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.categoryId) { setFormError("Vui lòng chọn khoản mục");  return; }
    if (!form.fundId)     { setFormError("Vui lòng chọn quỹ tiền");    return; }
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
        empName:       "",   // backend tự lấy từ JWT token
        branchId:      0,    // backend tự lấy từ JWT token
      });

      if (res?.code === 0 || res?.code === 200) {
        toast("✓ Tạo phiếu thành công");
        closeCreate();
      } else {
        toast(res?.message ?? "Tạo phiếu thất bại — vui lòng thử lại");
      }
    } catch {
      toast("Lỗi kết nối — vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  }, [form, categories, closeCreate]);

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
  } = useFinanceProgressiveList(DEBT_ALERTS, 10);

  // ── Khoản mục lọc theo loại giao dịch ────────────────────────────────────
  const filteredCats = categories.filter(c => c.type === form.type);

  // ── Format số tiền cho input ──────────────────────────────────────────────
  const displayAmount = form.amount
    ? new Intl.NumberFormat("vi-VN").format(parseInt(form.amount, 10))
    : "";

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
          <Link className="finance-link-button" to={urls.finance_management_cashbook}>
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
                <Link className="finance-link-button" to={urls.finance_management_cashbook}>
                  Xem toàn bộ sổ thu chi
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
                <Link className="finance-link-button" to={urls.finance_management_debt_management}>
                  Quản lý công nợ
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
      <FinanceSlideOver
        open={showCreate}
        title="Tạo phiếu thu / chi"
        onClose={closeCreate}
        footer={
          <>
            <button
              type="submit"
              form="create-cashbook-form"
              className="finance-action-btn finance-action-btn--primary"
              disabled={submitting}
            >
              {submitting ? <span className="finance-spinner" /> : "Lưu phiếu"}
            </button>
            <button
              type="button"
              className="finance-action-btn finance-action-btn--ghost"
              onClick={closeCreate}
            >
              Hủy
            </button>
          </>
        }
      >
        <form id="create-cashbook-form" className="finance-form" onSubmit={handleSubmit}>

          {/* Loại giao dịch */}
          <div className="finance-field">
            <label>Loại giao dịch</label>
            <div className="finance-radio-group">
              {([1, 2] as const).map(t => (
                <label
                  key={t}
                  className={[
                    "finance-radio-option",
                    `finance-radio-option--${t === 1 ? "income" : "expense"}`,
                    form.type === t ? "is-active" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <input
                    type="radio"
                    name="txn-type"
                    checked={form.type === t}
                    onChange={() => setForm(f => ({ ...f, type: t, categoryId: "" }))}
                  />
                  {t === 1 ? "Thu tiền" : "Chi tiền"}
                </label>
              ))}
            </div>
          </div>

          {/* Khoản mục */}
          <div className="finance-field">
            <label>Khoản mục *</label>
            <select
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              disabled={dropdownLoading}
            >
              <option value="">
                {dropdownLoading ? "Đang tải..." : "-- Chọn khoản mục --"}
              </option>
              {filteredCats.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              {/* Fallback khi categories chưa load */}
              {!dropdownLoading && filteredCats.length === 0 && (
                <>
                  {form.type === 1 ? (
                    <>
                      <option value="1">Doanh thu bán hàng</option>
                      <option value="2">Thu nợ khách hàng</option>
                      <option value="3">Thu dịch vụ</option>
                      <option value="4">Thu tiền đặt cọc</option>
                    </>
                  ) : (
                    <>
                      <option value="10">Nhập hàng</option>
                      <option value="11">Chi lương nhân viên</option>
                      <option value="12">Chi phí marketing</option>
                      <option value="13">Tiền điện, nước</option>
                      <option value="14">Bảo trì thiết bị</option>
                    </>
                  )}
                </>
              )}
            </select>
          </div>

          {/* Quỹ tiền */}
          <div className="finance-field">
            <label>Quỹ tiền *</label>
            <select
              value={form.fundId}
              onChange={e => setForm(f => ({ ...f, fundId: e.target.value }))}
              disabled={dropdownLoading}
            >
              <option value="">
                {dropdownLoading ? "Đang tải..." : "-- Chọn quỹ --"}
              </option>
              {funds.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}{f.balance > 0
                    ? ` — ${new Intl.NumberFormat("vi-VN").format(f.balance)} VND`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Số tiền */}
          <div className="finance-field">
            <label>Số tiền *</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0 VND"
              value={displayAmount}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, "");
                setForm(f => ({ ...f, amount: raw }));
              }}
            />
          </div>

          {/* Đối tượng liên quan */}
          <div className="finance-field">
            <label>Đối tượng liên quan (KH / NCC)</label>
            <input
              type="text"
              placeholder="Nhập tên khách hàng hoặc nhà cung cấp"
              value={form.relatedEntity}
              onChange={e => setForm(f => ({ ...f, relatedEntity: e.target.value }))}
            />
          </div>

          {/* Ngày giao dịch */}
          <div className="finance-field">
            <label>Ngày giao dịch</label>
            <input
              type="date"
              value={form.transDate}
              max={todayISO()}
              onChange={e => setForm(f => ({ ...f, transDate: e.target.value }))}
            />
          </div>

          {/* Nội dung */}
          <div className="finance-field">
            <label>Nội dung phiếu</label>
            <textarea
              rows={3}
              placeholder="Nhập diễn giải giao dịch..."
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>

          {formError && (
            <div className="finance-field__error">⚠ {formError}</div>
          )}

        </form>
      </FinanceSlideOver>

      {ToastNode}
    </FinancePageShell>
  );
}