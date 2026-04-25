// Shared constants + helpers cho module Events.

import type {
  EventEntity,
  EventRegistration,
  EventStatus,
  RegistrationStatus,
} from "./types";

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

export function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mi} ${dd}/${mm}/${yyyy}`;
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

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

/** Tính tổng tiền 1 đăng ký = ticketPrice (event) + sum(addOn × qty).
 *  Fallback khi BE không trả `totalAmount` (trường hợp Jackson drop hoặc
 *  endpoint cũ). Nếu reg.totalAmount đã có → dùng luôn.
 */
export function computeRegistrationTotal(
  r: EventRegistration,
  event: EventEntity,
): number {
  if (typeof r.totalAmount === "number" && r.totalAmount > 0) return r.totalAmount;
  const ticket = event.ticketPrice ?? 0;
  const addons = (r.selectedAddOns ?? []).reduce((acc, sel) => {
    const item = (event.addOnItems ?? []).find((i) => i.id === sel.addOnId);
    return acc + (item ? item.unitPrice * sel.qty : 0);
  }, 0);
  return ticket + addons;
}

export function getShareUrl(slug: string): string {
  const path = `/crm/events/${encodeURIComponent(slug)}`;
  if (typeof window === "undefined") return path;
  const base = window.location.origin + window.location.pathname.split("/crm")[0];
  return `${base}${path}`;
}
