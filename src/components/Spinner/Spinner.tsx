// Shared Spinner + LoadingBlock — thay thế các spinner inline rải rác (finance-spinner,
// "Đang tải..." text, custom CSS ring) bằng một primitive dùng chung.

import React from "react";
import "./Spinner.scss";

export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerTone = "default" | "light" | "muted";

interface SpinnerProps {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  className?: string;
  /** Accessibility label */
  label?: string;
}

export default function Spinner({
  size = "md",
  tone = "default",
  className = "",
  label = "Đang tải",
}: SpinnerProps) {
  return (
    <span
      className={`spinner spinner--${size} spinner--${tone} ${className}`.trim()}
      role="status"
      aria-label={label}
    />
  );
}

// ─── LoadingBlock: inline centered spinner + optional label ───────────────────
interface LoadingBlockProps {
  size?: SpinnerSize;
  label?: React.ReactNode;
  /** Min height của block, default 12rem */
  minHeight?: string | number;
  className?: string;
}

export function LoadingBlock({
  size = "md",
  label,
  minHeight = "12rem",
  className = "",
}: LoadingBlockProps) {
  return (
    <div className={`loading-block ${className}`.trim()} style={{ minHeight }}>
      <Spinner size={size} />
      {label && <div className="loading-block__label">{label}</div>}
    </div>
  );
}
