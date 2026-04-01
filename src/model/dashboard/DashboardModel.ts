import { IOption } from "model/OtherModel";
import React from "react";

// ── Existing interfaces (giữ nguyên) ─────────────────────────────────────────

export interface IOverview {
  type: "returns" | "invoice" | "amount";
  label: string;
  icon: React.ReactElement;
  old_value: number;
  current_value: number;
}

/** Shortcut hiển thị trên Dashboard (dùng khi render) */
export interface IShortcut {
  title: string;
  path: string;
  icon: React.ReactElement;
  background: string;
  target?: string;
}

export interface IVideoHelp {
  title: string;
  image: string;
  url: string;
}

export interface IEventTransaction {
  type: "sale" | "warehousing" | "order" | "customer_return" | "return_supplier";
  created_at: string;
  created_by: string;
  received: string;
}

// ── Shortcut config types ─────────────────────────────────────────────────────

/**
 * Các key hợp lệ - phải khớp với enum ShortcutKey trên backend
 */
export type ShortcutKey =
  | "POS"
  | "CUSTOMER"
  | "WAREHOUSE"
  | "FINANCE"
  | "INVOICE"
  | "TASK"
  | "PROMO_REPORT";

/**
 * Một option có thể chọn trong modal tùy chỉnh shortcut
 */
export interface IShortcutOption {
  key: ShortcutKey;
  label: string;
}

/**
 * Toàn bộ danh sách options - thứ tự hiển thị trong modal
 * path và icon sẽ được resolve ở runtime qua SHORTCUT_MAP
 */
export const SHORTCUT_OPTIONS: IShortcutOption[] = [
  { key: "POS",          label: "Bán hàng tại quầy (Tạo đơn)" },
  { key: "CUSTOMER",     label: "Khách hàng" },
  { key: "WAREHOUSE",    label: "Sổ kho" },
  { key: "FINANCE",      label: "Thông tin tài chính" },
  { key: "INVOICE",      label: "Danh sách hóa đơn" },
  { key: "TASK",         label: "Quản lý công việc" },
  { key: "PROMO_REPORT", label: "Báo cáo khuyến mãi" },
];

export const MAX_SHORTCUT = 5;
export const DEFAULT_SHORTCUT_KEYS: ShortcutKey[] = ["POS", "CUSTOMER", "WAREHOUSE", "FINANCE"];

// ── Existing fake/constant data (giữ nguyên) ──────────────────────────────────

export const eventTransactionDataFake: IEventTransaction[] = [
  { type: "sale",            received: "Khách lẻ",          created_at: "11:15 05/11/2021", created_by: "Đặng Xuân Trường" },
  { type: "warehousing",     received: "Công ty TNHH ABCD", created_at: "11:15 05/11/2021", created_by: "Đặng Xuân Trường" },
  { type: "order",           received: "Công ty Letsmiin",  created_at: "11:15 05/11/2021", created_by: "Đặng Xuân Trường" },
  { type: "customer_return", received: "Khách lẻ",          created_at: "11:15 05/11/2021", created_by: "Đặng Xuân Trường" },
  { type: "return_supplier", received: "Công ty Letsmiin",  created_at: "11:15 05/11/2021", created_by: "Đặng Xuân Trường" },
  { type: "sale",            received: "Khách lẻ",          created_at: "11:15 05/11/2021", created_by: "Đặng Xuân Trường" },
  { type: "warehousing",     received: "Công ty TNHH ABCD", created_at: "11:15 05/11/2021", created_by: "Đặng Xuân Trường" },
  { type: "order",           received: "Công ty Letsmiin",  created_at: "11:15 05/11/2021", created_by: "Đặng Xuân Trường" },
  { type: "customer_return", received: "Khách lẻ",          created_at: "11:15 05/11/2021", created_by: "Đặng Xuân Trường" },
  { type: "return_supplier", received: "Công ty Letsmiin",  created_at: "11:15 05/11/2021", created_by: "Đặng Xuân Trường" },
];

export const typeCalendar = {
  today: "today",
  yesterday: "yesterday",
  last7Days: "last_7_days",
  last30Days: "last_30_days",
  last90Days: "last_90_days",
};

export const dateFilter: IOption[] = [
  { value: "today",       label: "Hôm nay" },
  { value: "yesterday",   label: "Hôm qua" },
  { value: "last_7_days", label: "7 ngày gần đây" },
  { value: "last_30_days",label: "30 ngày gần đây" },
  { value: "last_90_days",label: "90 ngày gần đây" },
];