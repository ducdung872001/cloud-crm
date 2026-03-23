import React from "react";
import Icon from "components/icon";

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
  date:   string;
  amount: number;
  time?:  number;
}

// ── 1. Slide-over panel ──────────────────────────────────────────────────────

export function FinanceSlideOver(props: {
  open:     boolean;
  title:    string;
  onClose:  () => void;
  footer?:  React.ReactNode;
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
  incomeData:  IChartPoint[];
  expenseData: IChartPoint[];
}) {
  const inc = incomeData.slice(-30);
  const exp = expenseData.slice(-30);
  const n   = Math.max(inc.length, exp.length, 1);

  const maxVal = Math.max(...inc.map(d => d.amount), ...exp.map(d => d.amount), 1);

  const W = 680, H = 140, PAD_X = 10, PAD_TOP = 20, PAD_BOT = 24;
  const chartH = H - PAD_TOP - PAD_BOT;
  const slotW  = (W - PAD_X * 2) / n;
  const barW   = Math.max(4, Math.floor(slotW * 0.38));
  const gap    = 2;

  const bh  = (v: number) => Math.max(3, Math.round((v / maxVal) * chartH));
  const xL  = (i: number) => PAD_X + i * slotW + (slotW - barW * 2 - gap) / 2;
  const xR  = (i: number) => xL(i) + barW + gap;
  const yB  = (v: number) => PAD_TOP + chartH - bh(v);

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
        const i    = Math.min(Math.round(pct * (n - 1)), n - 1);
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