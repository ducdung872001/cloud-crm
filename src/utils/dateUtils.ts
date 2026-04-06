/**
 * Date utility functions using date-fns (tree-shakeable, ~7KB vs moment's 300KB).
 * Use these instead of moment() for new code.
 *
 * Migration guide from moment:
 *   moment(date).format("DD/MM/YYYY")      → formatDate(date)
 *   moment(date).format("DD/MM/YYYY HH:mm") → formatDateTime(date)
 *   moment(date).isValid()                  → isValidDate(date)
 *   moment(date).fromNow()                  → timeAgo(date)
 *   moment(date).diff(other, "days")        → diffDays(date, other)
 */
import { format, isValid, parseISO, formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes, parse } from "date-fns";
import { vi } from "date-fns/locale";

function toDate(input: string | Date | number | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isValid(input) ? input : null;
  if (typeof input === "number") return new Date(input);
  if (typeof input === "string") {
    // Try ISO format first
    const iso = parseISO(input);
    if (isValid(iso)) return iso;
    // Try DD/MM/YYYY format
    const ddmmyyyy = parse(input, "dd/MM/yyyy", new Date());
    if (isValid(ddmmyyyy)) return ddmmyyyy;
    // Try DD/MM/YYYY HH:mm
    const withTime = parse(input, "dd/MM/yyyy HH:mm", new Date());
    if (isValid(withTime)) return withTime;
    return null;
  }
  return null;
}

/** Format date as "DD/MM/YYYY" */
export function formatDate(input: string | Date | number | null | undefined): string {
  const d = toDate(input);
  return d ? format(d, "dd/MM/yyyy") : "";
}

/** Format date as "DD/MM/YYYY HH:mm" */
export function formatDateTime(input: string | Date | number | null | undefined): string {
  const d = toDate(input);
  return d ? format(d, "dd/MM/yyyy HH:mm") : "";
}

/** Format date with custom format string (date-fns tokens) */
export function formatDateCustom(input: string | Date | number | null | undefined, fmt: string): string {
  const d = toDate(input);
  return d ? format(d, fmt) : "";
}

/** Check if date is valid */
export function isValidDate(input: string | Date | number | null | undefined): boolean {
  return toDate(input) !== null;
}

/** "3 phút trước", "2 giờ trước" */
export function timeAgo(input: string | Date | number | null | undefined): string {
  const d = toDate(input);
  if (!d) return "";
  return formatDistanceToNow(d, { addSuffix: true, locale: vi });
}

/** Difference in days between two dates */
export function diffDays(a: string | Date, b: string | Date): number {
  const da = toDate(a);
  const db = toDate(b);
  if (!da || !db) return 0;
  return differenceInDays(da, db);
}

/** Difference in hours */
export function diffHours(a: string | Date, b: string | Date): number {
  const da = toDate(a);
  const db = toDate(b);
  if (!da || !db) return 0;
  return differenceInHours(da, db);
}

/** Difference in minutes */
export function diffMinutes(a: string | Date, b: string | Date): number {
  const da = toDate(a);
  const db = toDate(b);
  if (!da || !db) return 0;
  return differenceInMinutes(da, db);
}
