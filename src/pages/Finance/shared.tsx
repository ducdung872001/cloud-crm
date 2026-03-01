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
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { title, subtitle, actions, children } = props;

  return (
    <div className="page-content page__finance">
      <div className="finance-page__header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {actions ? <div className="finance-page__actions">{actions}</div> : null}
      </div>
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
