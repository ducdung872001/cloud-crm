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
  // subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { title, actions, children } = props;

  return (
    <div className="page-content page__finance">
      {/* <div className="finance-page__header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {actions ? <div className="finance-page__actions">{actions}</div> : null}
      </div> */}
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
