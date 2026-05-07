import { v4 as uuid } from "uuid";
import { db } from "../db/store.js";
import type { ZoomSlot, ZoomPoolAccount, ZoomBooking } from "../db/types.js";
import { applyTxn, computeBookingCost, ensureWallet, InsufficientCreditError } from "./credit-wallet.js";

/**
 * Zoom pool slot tracker + booking flow.
 *
 * Flow:
 *   1. Scanner cron quét pool accounts → cập nhật slot status.
 *      Stub: chỉ expire các slot đã qua giờ + free các reserved hết TTL.
 *      Production: gọi Zoom Calendar API (Meeting/List) để biết slot rảnh thật.
 *
 *   2. Booking: pick slot rảnh → reserve (TTL 5 phút) → spend credit → mark booked.
 *      Race-safe: reserve trước, deduct credit, nếu deduct fail thì release reservation.
 */

const RESERVATION_TTL_MS = 5 * 60_000;

/**
 * Cron tick: expire passed slots + release timed-out reservations.
 */
export function runPoolScanner(now = new Date()): { expired: number; released: number } {
  let expired = 0;
  let released = 0;
  for (const slot of db.zoomSlots.values()) {
    // Expire passed
    if (new Date(slot.endsAt) <= now && slot.status !== "expired" && slot.status !== "cancelled") {
      slot.status = "expired";
      expired++;
      continue;
    }
    // Release timed-out reservation
    if (slot.status === "reserved" && slot.reservedUntil && new Date(slot.reservedUntil) <= now) {
      slot.status = "free";
      slot.reservedUntil = undefined;
      slot.bookedBy = undefined;
      released++;
    }
  }
  return { expired, released };
}

export interface SlotQuery {
  /** Yêu cầu slot bắt đầu sau thời điểm này */
  notBefore?: Date;
  /** Phải kết thúc trước thời điểm này */
  notAfter?: Date;
  /** Tier mentorhub muốn limit account (vd Master+ ưu tiên licensed) */
  preferLicensed?: boolean;
  /** Owner type filter */
  ownerType?: ZoomPoolAccount["ownerType"];
}

export function findFreeSlots(query: SlotQuery = {}): ZoomSlot[] {
  const now = new Date();
  return Array.from(db.zoomSlots.values())
    .filter((s) => s.status === "free" && new Date(s.startsAt) > now)
    .filter((s) => !query.notBefore || new Date(s.startsAt) >= query.notBefore)
    .filter((s) => !query.notAfter || new Date(s.endsAt) <= query.notAfter)
    .filter((s) => {
      if (!query.preferLicensed && !query.ownerType) return true;
      const acc = db.zoomPoolAccounts.get(s.accountId);
      if (!acc) return false;
      if (query.preferLicensed && !acc.licensed) return false;
      if (query.ownerType && acc.ownerType !== query.ownerType) return false;
      return true;
    })
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export interface BookSlotInput {
  tenantId: string;
  sessionId: string;
  /** Bắt đầu mong muốn — service sẽ pick slot gần nhất phù hợp */
  startsAt: string;
  /** Thời lượng phút — default 60 */
  durationMin?: number;
  /** Cần licensed account (>40 phút Zoom) */
  needLicensed?: boolean;
  /** Số credit nominal — default 1 credit/phút */
  nominalCreditsOverride?: number;
  createdBy: string;
}

/**
 * Atomic booking: reserve → spend → confirm. Race-safe vì reservation có TTL.
 */
export function bookSlot(input: BookSlotInput): { booking: ZoomBooking; slot: ZoomSlot } {
  const start = new Date(input.startsAt);
  const duration = input.durationMin ?? 60;
  const end = new Date(start.getTime() + duration * 60_000);

  const candidates = findFreeSlots({
    notBefore: new Date(start.getTime() - 30 * 60_000), // chấp nhận slot bắt đầu trễ tối đa 30 phút sớm
    notAfter: new Date(end.getTime() + 30 * 60_000),
    preferLicensed: input.needLicensed,
  }).filter((s) => {
    // Phải đủ duration
    return new Date(s.endsAt).getTime() - new Date(s.startsAt).getTime() >= duration * 60_000;
  });

  if (candidates.length === 0) {
    throw new Error(`[zoom-pool] không có slot rảnh phù hợp cho start=${input.startsAt} dur=${duration}min`);
  }
  const slot = candidates[0]!;

  // 1. Reserve
  slot.status = "reserved";
  slot.reservedUntil = new Date(Date.now() + RESERVATION_TTL_MS).toISOString();
  slot.bookedBy = input.tenantId;
  slot.sessionId = input.sessionId;

  // 2. Compute cost + spend credit (atomic)
  const nominal = input.nominalCreditsOverride ?? duration;
  const cost = computeBookingCost(input.tenantId, nominal);

  try {
    ensureWallet(input.tenantId); // ensure exists
    applyTxn({
      tenantId: input.tenantId,
      type: "spend",
      amount: -cost,
      reason: `book_slot_${slot.id}`,
      sessionId: input.sessionId,
      createdBy: input.createdBy,
    });
  } catch (e) {
    // Release reservation
    slot.status = "free";
    slot.reservedUntil = undefined;
    slot.bookedBy = undefined;
    slot.sessionId = undefined;
    throw e;
  }

  // 3. Confirm booking
  slot.status = "booked";
  slot.reservedUntil = undefined;

  const booking: ZoomBooking = {
    id: "BK-" + uuid().slice(0, 8),
    tenantId: input.tenantId,
    sessionId: input.sessionId,
    slotId: slot.id,
    accountId: slot.accountId,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    creditCost: cost,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  db.zoomBookings.set(booking.id, booking);

  // Earn rate cho contributor (mentor góp account ngoài platform)
  const account = db.zoomPoolAccounts.get(slot.accountId);
  if (account && account.ownerType !== "platform" && account.contributorEarnRatePct > 0) {
    const earnAmount = Math.round(cost * account.contributorEarnRatePct / 100);
    if (earnAmount > 0) {
      const contributorTenantId = account.ownerType === "mentor" ? `TENANT-${account.ownerId}` : `TENANT-WIT-${account.ownerId}`;
      ensureWallet(contributorTenantId);
      applyTxn({
        tenantId: contributorTenantId,
        type: "earn",
        amount: earnAmount,
        reason: `contributor_earn_booking_${booking.id}`,
        bookingId: booking.id,
        createdBy: "system",
      });
    }
  }

  return { booking, slot };
}

export interface CancelBookingInput {
  bookingId: string;
  reason?: string;
  /** Chính sách refund: trước H-2 → full refund, sau H-2 → 50%, sau H-0 → 0% */
  cancelledBy: string;
}

export function cancelBooking(input: CancelBookingInput): { booking: ZoomBooking; refunded: number } {
  const booking = db.zoomBookings.get(input.bookingId);
  if (!booking) throw new Error(`[zoom-pool] booking ${input.bookingId} not found`);
  if (booking.status !== "active") throw new Error(`[zoom-pool] booking already ${booking.status}`);

  const now = Date.now();
  const start = new Date(booking.startsAt).getTime();
  const hoursUntilStart = (start - now) / 3_600_000;

  let refundPct = 0;
  if (hoursUntilStart > 2) refundPct = 100;
  else if (hoursUntilStart > 0) refundPct = 50;

  const refunded = Math.round((booking.creditCost * refundPct) / 100);

  if (refunded > 0) {
    applyTxn({
      tenantId: booking.tenantId,
      type: "refund",
      amount: refunded,
      reason: `cancel_booking_${booking.id} (refund ${refundPct}%)`,
      bookingId: booking.id,
      createdBy: input.cancelledBy,
    });
  }

  booking.status = "cancelled";
  booking.cancelledAt = new Date().toISOString();
  booking.cancelReason = input.reason;

  // Free slot back
  const slot = db.zoomSlots.get(booking.slotId);
  if (slot) {
    slot.status = "cancelled";
    slot.bookedBy = undefined;
    slot.sessionId = undefined;
  }

  return { booking, refunded };
}

export function listBookings(tenantId: string, opts?: { status?: ZoomBooking["status"]; limit?: number }): ZoomBooking[] {
  return Array.from(db.zoomBookings.values())
    .filter((b) => b.tenantId === tenantId)
    .filter((b) => !opts?.status || b.status === opts.status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, opts?.limit ?? 100);
}
