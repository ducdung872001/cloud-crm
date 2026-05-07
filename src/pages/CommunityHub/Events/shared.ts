// Shared constants + helpers cho module Events.

import { getCookie } from "reborn-util";
import type {
  EventEntity,
  EventRegistration,
  EventStatus,
  RegistrationStatus,
} from "./types";
import { formatVNDateTime, formatVNDate } from "./datetime";

/** Yc 7/5: chỉ admin đã login mới được nhìn thấy event đánh dấu isTest trên
 *  trang public (/crm/events, /crm/events/:slug). Visitor chưa login → false.
 *  Logged-in non-admin → false. Logged-in admin (user.root === "1") → true. */
export function isLoggedInAdmin(): boolean {
  if (typeof window === "undefined") return false;
  let token = "";
  try { token = getCookie("token") || ""; } catch { /* ignore */ }
  if (!token) return false;
  try {
    return window.localStorage.getItem("user.root") === "1";
  } catch {
    return false;
  }
}

export const THEME = {
  primary: "#00C9A7",
  primaryDark: "#0B2E2A",
  primarySoft: "#E4F7F3",
  accent: "#FF8A3C",
  danger: "#E85D4B",
  warning: "#F5A623",
  success: "#22C55E",
  info: "#3B82F6",
  textMain: "#1A2B28",
  textMuted: "#6B8A85",
  border: "#D9E0DE",
  bg: "#F5F9F8",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Nháp",
  published: "Đang công bố",
  ongoing: "Đang diễn ra",
  ended: "Đã kết thúc",
  cancelled: "Đã huỷ",
};

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  draft: "#9CA3AF",
  published: "#00C9A7",
  ongoing: "#3B82F6",
  ended: "#6B7280",
  cancelled: "#E85D4B",
};

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  checked_in: "Đã check-in",
  cancelled: "Đã huỷ",
  no_show: "Không đến",
};

export const REGISTRATION_STATUS_COLORS: Record<RegistrationStatus, string> = {
  pending: "#F5A623",
  confirmed: "#00C9A7",
  checked_in: "#3B82F6",
  cancelled: "#E85D4B",
  no_show: "#6B7280",
};

export function formatVND(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}

export const formatDateTime = formatVNDateTime;
export const formatDate = formatVNDate;

/** Tự động xác định status hiệu dụng dựa trên thời gian hiện tại */
export function getEffectiveStatus(
  status: EventStatus,
  startDate: string,
  endDate: string
): EventStatus {
  if (status === "draft" || status === "cancelled") return status;
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now > end) return "ended";
  if (now >= start) return "ongoing";
  return "published";
}

/** Tính tổng tiền 1 đăng ký = ticketPrice (event) + sum(addOn × qty)
 *  + giá option dynamic fields (checkbox tick / select option có price).
 *
 *  Note: trước đây nếu BE trả `r.totalAmount > 0` thì trust BE luôn — nhưng
 *  tester yc 2026-05-06 báo BE có lúc trả thiếu (vd quên cộng addOn áo yoga).
 *  → recompute FE dựa trên event config + dùng max(BE, FE) để không undercount.
 *  BE total chỉ thắng khi cao hơn (vd có phụ phí BE-only mà FE không biết).
 */
export function computeRegistrationTotal(
  r: EventRegistration,
  event: EventEntity,
): number {
  const ticket = event.ticketPrice ?? 0;
  const addons = (r.selectedAddOns ?? []).reduce((acc, sel) => {
    const item = (event.addOnItems ?? []).find((i) => i.id === sel.addOnId);
    return acc + (item ? item.unitPrice * sel.qty : 0);
  }, 0);
  const dyn = (event.dynamicFields ?? []).reduce((acc, f) => {
    const v = r.dynamicFieldValues?.[f.id];
    if (!v) return acc;
    if (f.type === "checkbox" && v === "true" && (f.price ?? 0) > 0) return acc + f.price!;
    if (f.type === "select" && f.optionPrices?.[v]) return acc + f.optionPrices[v];
    return acc;
  }, 0);
  const feTotal = ticket + addons + dyn;
  const beTotal = typeof r.totalAmount === "number" ? r.totalAmount : 0;
  return Math.max(feTotal, beTotal);
}

export function getShareUrl(slug: string): string {
  const path = `/crm/events/${encodeURIComponent(slug)}`;
  if (typeof window === "undefined") return path;
  const base = window.location.origin + window.location.pathname.split("/crm")[0];
  return `${base}${path}`;
}
