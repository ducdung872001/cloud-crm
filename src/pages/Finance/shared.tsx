import React from "react";
import Icon from "components/icon";
import { toApiDateFormat } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " VND";
}

export function formatDate(value: string) {
  const parts = value.split("T")[0].split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const date = new Date(value);
  return date.toLocaleDateString("vi-VN");
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function FinancePageShell(props: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { children } = props;

  return (
    <div className="page-content page__finance">
      {children}
    </div>
  );
}

export function FinanceStatCard(props: {
  label: string;
  value: string;
  helper?: string;
  tone?: "neutral" | "success" | "danger" | "warning";
}) {
  const { label, value, helper, tone = "neutral" } = props;

  return (
    <div className={`finance-stat-card finance-stat-card--${tone}`}>
      <span className="finance-stat-card__label">{label}</span>
      <strong className="finance-stat-card__value">{value}</strong>
      {helper ? <span className="finance-stat-card__helper">{helper}</span> : null}
    </div>
  );
}

export function FinanceBadge(props: {
  tone: "success" | "danger" | "warning" | "neutral";
  children: React.ReactNode;
}) {
  const { tone, children } = props;

  return <span className={`finance-badge finance-badge--${tone}`}>{children}</span>;
}

export function FinanceEmptyState(props: { title: string; description: string }) {
  const { title, description } = props;

  return (
    <div className="finance-empty-state">
      <Icon name="CashBook" />
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

export function FinanceLoadMoreIndicator(props: { loading: boolean; hasMore: boolean; label?: string }) {
  const { loading, hasMore, label = "Đang tải thêm dữ liệu..." } = props;

  if (!loading && !hasMore) {
    return null;
  }

  return (
    <div className="finance-load-more">
      {loading ? (
        <>
          <span className="finance-load-more__dot" />
          <span>{label}</span>
        </>
      ) : (
        <span>Cuộn xuống để tải thêm</span>
      )}
    </div>
  );
}

export function useFinanceProgressiveList<T>(items: T[], pageSize = 10, enabled = true) {
  const [visibleCount, setVisibleCount] = React.useState<number>(enabled ? Math.min(pageSize, items.length) : items.length);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setVisibleCount(enabled ? Math.min(pageSize, items.length) : items.length);
    setIsLoading(false);
  }, [enabled, items, pageSize]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const requestMore = () => {
    if (!enabled || isLoading || visibleCount >= items.length) {
      return;
    }

    setIsLoading(true);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setVisibleCount((current) => Math.min(current + pageSize, items.length));
      setIsLoading(false);
      timerRef.current = null;
    }, 450);
  };

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    if (!enabled) {
      return;
    }

    const target = event.currentTarget;
    const nearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 40;

    if (nearBottom) {
      requestMore();
    }
  };

  return {
    visibleItems: enabled ? items.slice(0, visibleCount) : items,
    visibleCount: enabled ? Math.min(visibleCount, items.length) : items.length,
    isLoading,
    hasMore: enabled && visibleCount < items.length,
    handleScroll,
    requestMore,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PHẦN MỞ RỘNG — Dashboard components
// ─────────────────────────────────────────────────────────────────────────────

// ── Type cho chart data ──────────────────────────────────────────────────────
export interface IChartPoint {
  date: string;
  amount: number;
  time?: number;
}

// ── 1. Slide-over panel ──────────────────────────────────────────────────────

export function FinanceSlideOver(props: {
  open: boolean;
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { open, title, onClose, footer, children } = props;

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="finance-slide-backdrop" onClick={onClose} />
      <aside className="finance-slide-panel">
        <div className="finance-slide-header">
          <h2>{title}</h2>
          <button className="finance-slide-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div className="finance-slide-body">{children}</div>
        {footer && <div className="finance-slide-footer">{footer}</div>}
      </aside>
    </>
  );
}

// ── 2. Mini bar chart (SVG thuần, không cần lib) ─────────────────────────────

export function FinanceMiniBarChart({ incomeData, expenseData }: {
  incomeData: IChartPoint[];
  expenseData: IChartPoint[];
}) {
  const inc = incomeData.slice(-30);
  const exp = expenseData.slice(-30);
  const n = Math.max(inc.length, exp.length, 1);

  const maxVal = Math.max(...inc.map(d => d.amount), ...exp.map(d => d.amount), 1);

  const W = 680, H = 140, PAD_X = 10, PAD_TOP = 20, PAD_BOT = 24;
  const chartH = H - PAD_TOP - PAD_BOT;
  const slotW = (W - PAD_X * 2) / n;
  const barW = Math.max(4, Math.floor(slotW * 0.38));
  const gap = 2;

  const bh = (v: number) => Math.max(3, Math.round((v / maxVal) * chartH));
  const xL = (i: number) => PAD_X + i * slotW + (slotW - barW * 2 - gap) / 2;
  const xR = (i: number) => xL(i) + barW + gap;
  const yB = (v: number) => PAD_TOP + chartH - bh(v);

  const gridLines = [0.25, 0.5, 0.75].map(p => PAD_TOP + chartH - Math.round(p * chartH));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="finance-bar-chart" aria-label="Biểu đồ thu chi 30 ngày">
      {gridLines.map((y, i) => (
        <line key={i} x1={PAD_X} y1={y} x2={W - PAD_X} y2={y} stroke="#edf2f5" strokeWidth="1" />
      ))}
      {inc.map((d, i) => (
        <rect key={`i${i}`} x={xL(i)} y={yB(d.amount)} width={barW} height={bh(d.amount)} rx="2" fill="#138a4b" opacity="0.82" />
      ))}
      {exp.map((d, i) => (
        <rect key={`e${i}`} x={xR(i)} y={yB(d.amount)} width={barW} height={bh(d.amount)} rx="2" fill="#c54a37" opacity="0.75" />
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
        const i = Math.min(Math.round(pct * (n - 1)), n - 1);
        const item = inc[i] ?? exp[i];
        if (!item) return null;
        return (
          <text key={idx} x={xL(i) + barW} y={H - 4} textAnchor="middle" fontSize="11" fill="#9aafbd">
            {item.date}
          </text>
        );
      })}
      <circle cx={W - 110} cy={10} r="5" fill="#138a4b" />
      <text x={W - 102} y="14" fontSize="11" fill="#6f8494">Thu tiền</text>
      <circle cx={W - 52} cy={10} r="5" fill="#c54a37" />
      <text x={W - 44} y="14" fontSize="11" fill="#6f8494">Chi tiền</text>
    </svg>
  );
}

// ── 3. Toast hook ────────────────────────────────────────────────────────────

export function useFinanceToast() {
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const toast = (msg: string) => setMessage(msg);

  const ToastNode = message ? (
    <div className="finance-toast" role="alert">{message}</div>
  ) : null;

  return { toast, ToastNode };
}

// ─────────────────────────────────────────────────────────────────────────────
// CashbookSlideOver — Component dùng chung cho Tạo phiếu Thu / Chi
// Dùng tại: Dashboard (onSuccess = toast + close)
//           CashBook  (onSuccess = toast + close + reload list)
// ─────────────────────────────────────────────────────────────────────────────

import CashbookService from "services/CashbookService";
import CategoryService from "services/CategoryService";
import { urlsApi } from "configs/urls";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CashbookFormState {
  type: 1 | 2;
  categoryId: string;
  fundId: string;
  amount: string;
  relatedEntity: string;
  transDate: string;
  note: string;
}

interface CashbookCategoryItem {
  id: number;
  name: string;
  type: number; // 1=thu, 2=chi
}

interface CashbookFundItem {
  id: number;
  name: string;
  balance: number;
}

const CASHBOOK_FORM_INIT: CashbookFormState = {
  type: 1, categoryId: "", fundId: "",
  amount: "", relatedEntity: "",
  transDate: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })(),
  note: "",
};

const fundOverviewUrl = () =>
  (urlsApi.financeDashboard as any).full.replace("/finance/dashboard", "/fund/overview");

// ── QuickCreateCategory — mini inline form tạo nhanh khoản mục ───────────────

interface QuickCreateCategoryProps {
  type: 1 | 2;
  onCreated: (cat: CashbookCategoryItem) => void;
  onCancel: () => void;
}

function QuickCreateCategory({ type, onCreated, onCancel }: QuickCreateCategoryProps) {
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Vui lòng nhập tên khoản mục"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await CategoryService.update({
        id: 0,        // 0 = tạo mới
        name: trimmed,
        type,
        position: 0,
        bsnId: 0,        // backend tự lấy từ JWT
      });
      // Response DfResponse: code 0/200 = OK, result là object category vừa tạo
      const ok = res?.code === 0 || res?.code === 200;
      if (ok) {
        const created = res?.result ?? res?.data ?? {};
        onCreated({
          id: Number(created.id ?? 0),
          name: trimmed,
          type,
        });
      } else {
        setError(res?.message ?? "Tạo khoản mục thất bại");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="finance-quick-create">
      <div className="finance-quick-create__title">
        + Tạo khoản mục mới ({type === 1 ? "thu" : "chi"})
      </div>
      <div className="finance-quick-create__row">
        <input
          type="text"
          className="finance-quick-create__input"
          placeholder="Tên khoản mục..."
          value={name}
          autoFocus
          onChange={e => { setName(e.target.value); setError(""); }}
          onKeyDown={e => {
            if (e.key === "Enter") { e.preventDefault(); handleSave(); }
            if (e.key === "Escape") onCancel();
          }}
          disabled={saving}
        />
        <button
          type="button"
          className="finance-quick-create__btn finance-quick-create__btn--save"
          onClick={handleSave}
          disabled={saving || !name.trim()}
        >
          {saving ? <span className="finance-spinner finance-spinner--sm" /> : "Lưu"}
        </button>
        <button
          type="button"
          className="finance-quick-create__btn finance-quick-create__btn--cancel"
          onClick={onCancel}
          disabled={saving}
        >
          Hủy
        </button>
      </div>
      {error && <div className="finance-quick-create__error">⚠ {error}</div>}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface CashbookSlideOverProps {
  /** Hiển thị / ẩn slide-over */
  open: boolean;
  /** Callback khi đóng (không lưu) */
  onClose: () => void;
  /**
   * Callback sau khi tạo phiếu thành công.
   * Dashboard: chỉ toast.
   * CashBook:  toast + reload danh sách.
   */
  onSuccess: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CashbookSlideOver({ open, onClose, onSuccess }: CashbookSlideOverProps) {
  const { dataInfoEmployee, dataBranch } = React.useContext(UserContext) as ContextType;
  const [form, setForm] = React.useState<CashbookFormState>(CASHBOOK_FORM_INIT);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [categories, setCategories] = React.useState<CashbookCategoryItem[]>([]);
  const [funds, setFunds] = React.useState<CashbookFundItem[]>([]);
  const [dropdownLoading, setDropdownLoading] = React.useState(false);
  const [showQuickCreate, setShowQuickCreate] = React.useState(false);

  const { toast, ToastNode } = useFinanceToast();

  // ── Load dropdowns khi mở ───────────────────────────────────────────────────
  React.useEffect(() => {
    if (!open) return;
    setDropdownLoading(true);

    Promise.allSettled([
      CategoryService.list({ page: 1, limit: 200 } as any),
      fetch(fundOverviewUrl()).then(r => r.json()),
    ]).then(([catRes, fundRes]) => {
      if (catRes.status === "fulfilled") {
        // DfResponse: result là array hoặc object có content
        const raw = catRes.value?.result?.content
          ?? catRes.value?.result
          ?? catRes.value?.data?.content
          ?? catRes.value?.data
          ?? [];
        setCategories(
          (Array.isArray(raw) ? raw : []).map((c: any) => ({
            id: Number(c.id),
            name: String(c.name ?? ""),
            type: Number(c.type ?? 1),
          }))
        );
      }
      if (fundRes.status === "fulfilled") {
        // FundOverview: res.result.funds
        const rawFunds = fundRes.value?.result?.funds
          ?? fundRes.value?.data?.funds
          ?? [];
        setFunds(
          (Array.isArray(rawFunds) ? rawFunds : []).map((f: any) => ({
            id: Number(f.id),
            name: String(f.name ?? ""),
            balance: Number(f.balance ?? 0),
          }))
        );
      }
    }).finally(() => setDropdownLoading(false));
  }, [open]);

  // ── Reset khi đóng ──────────────────────────────────────────────────────────
  const handleClose = React.useCallback(() => {
    setForm(CASHBOOK_FORM_INIT);
    setFormError("");
    setShowQuickCreate(false);
    onClose();
  }, [onClose]);

  // ── Thêm khoản mục vừa tạo vào list + tự chọn luôn ────────────────────────
  const handleCategoryCreated = React.useCallback((cat: CashbookCategoryItem) => {
    setCategories(prev => [...prev, cat]);
    setForm(f => ({ ...f, categoryId: String(cat.id) }));
    setShowQuickCreate(false);
    toast(`✓ Đã tạo khoản mục "${cat.name}"`);
  }, [toast]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.categoryId) { setFormError("Vui lòng chọn khoản mục"); return; }
    if (!form.fundId) { setFormError("Vui lòng chọn quỹ tiền"); return; }
    const amountNum = parseInt(form.amount.replace(/\D/g, ""), 10);
    if (!amountNum || amountNum <= 0) { setFormError("Số tiền phải lớn hơn 0"); return; }

    setSubmitting(true);
    console.log("idEmployee:", dataInfoEmployee, "transDate:", form.transDate);


    try {
      const catName = categories.find(c => c.id === Number(form.categoryId))?.name ?? "";
      const res = await CashbookService.update({
        type: form.type,
        categoryId: Number(form.categoryId),
        categoryName: catName,
        fundId: Number(form.fundId),
        amount: amountNum,
        note: form.note,        
        fmtTransDate: `${toApiDateFormat(form.transDate)} 00:00`,
        relatedEntity: form.relatedEntity,        
        employeeId:    dataInfoEmployee?.id,
        empName: "",  // backend tự lấy từ JWT
        branchId: dataBranch.value,   // truyền từ FE xuống
      });

      if (res?.code === 0 || res?.code === 200) {
        toast("✓ Tạo phiếu thành công");
        handleClose();
        onSuccess();
      } else {
        setFormError(res?.message ?? "Tạo phiếu thất bại — vui lòng thử lại");
      }
    } catch {
      setFormError("Lỗi kết nối — vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  }, [form, categories, handleClose, onSuccess]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filteredCats = categories.filter(c => c.type === form.type);
  const today = new Date().toISOString().split("T")[0];
  const displayAmount = form.amount
    ? new Intl.NumberFormat("vi-VN").format(parseInt(form.amount, 10))
    : "";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {ToastNode}
      <FinanceSlideOver
        open={open}
        title="Tạo phiếu thu / chi"
        onClose={handleClose}
        footer={
          <>
            <button
              type="submit"
              form="cashbook-slide-form"
              className="finance-action-btn finance-action-btn--primary"
              disabled={submitting}
            >
              {submitting ? <span className="finance-spinner" /> : "Lưu phiếu"}
            </button>
            <button
              type="button"
              className="finance-action-btn finance-action-btn--ghost"
              onClick={handleClose}
              disabled={submitting}
            >
              Hủy
            </button>
          </>
        }
      >
        {dropdownLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <span className="finance-spinner" />
          </div>
        ) : (
          <form id="cashbook-slide-form" className="finance-form" onSubmit={handleSubmit}>

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
                      name="cashbook-slide-type"
                      checked={form.type === t}
                      onChange={() => {
                        setForm(f => ({ ...f, type: t, categoryId: "" }));
                        setShowQuickCreate(false);
                      }}
                    />
                    {t === 1 ? "Thu tiền" : "Chi tiền"}
                  </label>
                ))}
              </div>
            </div>

            {/* Khoản mục */}
            <div className="finance-field">
              <div className="finance-field__label-row">
                <label>Khoản mục *</label>
                {!showQuickCreate && (
                  <button
                    type="button"
                    className="finance-field__add-link"
                    onClick={() => setShowQuickCreate(true)}
                  >
                    + Tạo mới
                  </button>
                )}
              </div>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                disabled={dropdownLoading || showQuickCreate}
              >
                <option value="">
                  {dropdownLoading ? "Đang tải..." : filteredCats.length === 0 ? "Chưa có khoản mục — tạo mới bên dưới" : "-- Chọn khoản mục --"}
                </option>
                {filteredCats.map(c => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
              {showQuickCreate && (
                <QuickCreateCategory
                  type={form.type}
                  onCreated={handleCategoryCreated}
                  onCancel={() => setShowQuickCreate(false)}
                />
              )}
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
                {funds.map(fund => (
                  <option key={fund.id} value={String(fund.id)}>
                    {fund.name}{fund.balance > 0
                      ? ` — ${new Intl.NumberFormat("vi-VN").format(fund.balance)} VND`
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
                  const digits = e.target.value.replace(/\D/g, "");
                  setForm(f => ({ ...f, amount: digits }));
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
                max={today}
                onChange={e => setForm(f => ({ ...f, transDate: e.target.value }))}
              />
            </div>

            {/* Nội dung phiếu */}
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
        )}
      </FinanceSlideOver>
    </>
  );
}