// TNPM shared UI components — import from "components/tnpm"
export { KpiCard, KpiRow } from "./KpiCard";
export type { KpiCardProps, KpiRowProps } from "./KpiCard";

export { PageHeader } from "./PageHeader";
export type { PageHeaderProps } from "./PageHeader";

export { TabBar } from "./TabBar";
export type { TabBarProps, TabItem } from "./TabBar";

export { ModalShell, ConfirmDialog } from "./ModalShell";
export type { ModalShellProps, ConfirmDialogProps } from "./ModalShell";

export { StatusBadge } from "./StatusBadge";
export type { StatusBadgeProps } from "./StatusBadge";

// Shared helpers
export const fmtMoney = (n: number): string => {
  const neg = n < 0;
  const abs = Math.abs(n);
  const s = abs >= 1e9
    ? `${(abs / 1e9).toFixed(2)} tỷ`
    : abs >= 1e6
    ? `${(abs / 1e6).toFixed(1)} tr đ`
    : `${abs.toLocaleString("vi-VN")} đ`;
  return neg ? `−${s}` : s;
};

export const daysUntil = (dateStr: string): number | null => {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  return Math.floor((d.getTime() - today.getTime()) / 86400000);
};
