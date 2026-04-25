// Shared StatCard — unify 3 variants cũ (finance-stat-card / stat-card / stat-pill).
//
// Variants thị giác:
//   - "default" : column, label trên, value to, optional helper dưới (thay finance-stat-card)
//   - "icon"    : row, icon tròn bên trái, label + value column bên phải (thay stat-card CH)
//   - "pill"    : compact row, dot màu + number + label inline (thay stat-pill customer)
//
// Props:
//   label, value, helper?, icon?, tone?, variant?, action?, dotColor?, onClick?
//
// Tones (ảnh hưởng màu nền/viền): neutral | success | danger | warning | primary | accent

import React from "react";
import "./StatCard.scss";

export type StatCardTone =
  | "neutral"
  | "success"
  | "danger"
  | "warning"
  | "primary"
  | "accent";

export type StatCardVariant = "default" | "icon" | "pill";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
  /** Chỉ dùng với variant="icon" — render bên trái value */
  icon?: React.ReactNode;
  /** Dot màu — chỉ dùng với variant="pill" */
  dotColor?: string;
  tone?: StatCardTone;
  variant?: StatCardVariant;
  /** Nút action hiển thị cạnh value (ví dụ mask toggle 👁️) */
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function StatCard({
  label,
  value,
  helper,
  icon,
  dotColor,
  tone = "neutral",
  variant = "default",
  action,
  onClick,
  className = "",
}: StatCardProps) {
  const rootCls = [
    "stat-card",
    `stat-card--${variant}`,
    `stat-card--tone-${tone}`,
    onClick ? "stat-card--clickable" : "",
    className,
  ].filter(Boolean).join(" ");

  // Pill: compact inline with dot
  if (variant === "pill") {
    return (
      <div className={rootCls} onClick={onClick} role={onClick ? "button" : undefined}>
        {dotColor && <span className="stat-card__dot" style={{ background: dotColor }} />}
        <div className="stat-card__pill-body">
          <div className="stat-card__value">{value}</div>
          <div className="stat-card__label">{label}</div>
        </div>
      </div>
    );
  }

  // Icon: row layout với icon tròn
  if (variant === "icon") {
    return (
      <div className={rootCls} onClick={onClick} role={onClick ? "button" : undefined}>
        {icon && <div className="stat-card__icon-circle">{icon}</div>}
        <div className="stat-card__body">
          <div className="stat-card__label">{label}</div>
          <div className="stat-card__value-row">
            <span className="stat-card__value">{value}</span>
            {action && <span className="stat-card__action">{action}</span>}
          </div>
          {helper && <div className="stat-card__helper">{helper}</div>}
        </div>
      </div>
    );
  }

  // Default: column layout (Finance style)
  return (
    <div className={rootCls} onClick={onClick} role={onClick ? "button" : undefined}>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value-row">
        <span className="stat-card__value">{value}</span>
        {action && <span className="stat-card__action">{action}</span>}
      </div>
      {helper && <div className="stat-card__helper">{helper}</div>}
    </div>
  );
}
