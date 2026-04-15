// Shared UI primitives cho tax module — giữ neutral, không import gì từ `components/`
// của app chính để dễ copy sang nhánh khác.

import React from "react";
import { taxTheme as T } from "./theme";

export const formatVND = (n: number): string =>
  new Intl.NumberFormat("vi-VN").format(Math.round(n));

export const formatVNDFull = (n: number): string => `${formatVND(n)} ₫`;

export const formatPct = (n: number): string => `${(n * 100).toFixed(1)}%`;

// ═══ Card ═════════════════════════════════════════════════════════════════
export function Card({
  title,
  subtitle,
  right,
  children,
  style,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: T.colors.cardBg,
        border: `1px solid ${T.colors.border}`,
        borderRadius: T.radius.lg,
        padding: T.spacing.lg,
        boxShadow: T.shadow.sm,
        ...style,
      }}
    >
      {(title || right) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: title ? T.spacing.md : 0,
          }}
        >
          <div>
            {title && (
              <div
                style={{
                  fontSize: T.font.h3,
                  fontWeight: 700,
                  color: T.colors.primaryDark,
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div
                style={{
                  fontSize: T.font.small,
                  color: T.colors.textMuted,
                  marginTop: 2,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

// ═══ Button ═══════════════════════════════════════════════════════════════
export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  style,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: React.CSSProperties;
  type?: "button" | "submit";
}) {
  const palette = {
    primary: { bg: T.colors.primary, color: "#fff", border: T.colors.primary },
    secondary: {
      bg: T.colors.primarySoft,
      color: T.colors.primaryDark,
      border: T.colors.primary,
    },
    ghost: { bg: "transparent", color: T.colors.primaryDark, border: T.colors.border },
    danger: { bg: T.colors.danger, color: "#fff", border: T.colors.danger },
  }[variant];
  const sizes = {
    sm: { padding: "6px 12px", fontSize: T.font.small },
    md: { padding: "9px 16px", fontSize: T.font.body },
    lg: { padding: "12px 22px", fontSize: T.font.h3 },
  }[size];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        borderRadius: T.radius.md,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s",
        ...sizes,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ═══ Badge ════════════════════════════════════════════════════════════════
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const palette = {
    neutral: { bg: "#F1F5F4", color: T.colors.textMuted },
    success: { bg: "#DCFCE7", color: "#15803D" },
    warning: { bg: "#FEF3C7", color: "#B45309" },
    danger: { bg: "#FEE2E2", color: "#B91C1C" },
    info: { bg: "#DBEAFE", color: "#1E40AF" },
  }[tone];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: T.radius.pill,
        background: palette.bg,
        color: palette.color,
        fontSize: T.font.tiny,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

// ═══ KPI tile ═════════════════════════════════════════════════════════════
export function KpiTile({
  label,
  value,
  hint,
  tone = "primary",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
  icon?: string;
}) {
  const toneColors = {
    primary: T.colors.primary,
    success: T.colors.success,
    warning: T.colors.warning,
    danger: T.colors.danger,
    info: T.colors.info,
  }[tone];
  return (
    <div
      style={{
        background: T.colors.cardBg,
        border: `1px solid ${T.colors.border}`,
        borderLeft: `4px solid ${toneColors}`,
        borderRadius: T.radius.lg,
        padding: T.spacing.lg,
        minHeight: 110,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          fontSize: T.font.small,
          color: T.colors.textMuted,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: T.colors.primaryDark,
          marginTop: 8,
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            fontSize: T.font.tiny,
            color: T.colors.textMuted,
            marginTop: 4,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

// ═══ Input ════════════════════════════════════════════════════════════════
export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", marginBottom: T.spacing.md }}>
      <div
        style={{
          fontSize: T.font.small,
          fontWeight: 600,
          color: T.colors.primaryDark,
          marginBottom: 4,
        }}
      >
        {label}
        {required && <span style={{ color: T.colors.danger }}> *</span>}
      </div>
      {children}
      {hint && (
        <div style={{ fontSize: T.font.tiny, color: T.colors.textMuted, marginTop: 3 }}>
          {hint}
        </div>
      )}
    </label>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: T.radius.md,
  border: `1px solid ${T.colors.border}`,
  fontSize: T.font.body,
  background: "#fff",
  color: T.colors.textMain,
  outline: "none",
  boxSizing: "border-box",
};

// ═══ Section heading ══════════════════════════════════════════════════════
export function PageHeader({
  icon,
  title,
  subtitle,
  right,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: T.spacing.xl,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            color: T.colors.primaryDark,
            fontSize: T.font.h1,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              margin: "6px 0 0 0",
              color: T.colors.textMuted,
              fontSize: T.font.body,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

// ═══ Alert ════════════════════════════════════════════════════════════════
export function Alert({
  tone,
  title,
  children,
  action,
}: {
  tone: "info" | "warning" | "danger" | "success";
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const palette = {
    info: { bg: "#EFF6FF", border: "#3B82F6", color: "#1E40AF", icon: "ℹ" },
    warning: { bg: "#FFFBEB", border: "#F59E0B", color: "#92400E", icon: "⚠" },
    danger: { bg: "#FEF2F2", border: "#EF4444", color: "#991B1B", icon: "⛔" },
    success: { bg: "#F0FDF4", border: "#22C55E", color: "#14532D", icon: "✓" },
  }[tone];
  return (
    <div
      style={{
        background: palette.bg,
        borderLeft: `4px solid ${palette.border}`,
        borderRadius: T.radius.md,
        padding: "12px 16px",
        color: palette.color,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        marginBottom: T.spacing.md,
      }}
    >
      <span style={{ fontSize: 18 }}>{palette.icon}</span>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 700, marginBottom: 2 }}>{title}</div>}
        <div style={{ fontSize: T.font.body }}>{children}</div>
      </div>
      {action}
    </div>
  );
}
