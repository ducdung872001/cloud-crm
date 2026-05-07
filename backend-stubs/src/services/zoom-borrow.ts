import { v4 as uuid } from "uuid";
import { db } from "../db/store.js";
import type { ZoomBorrowRequest, ZoomSlot } from "../db/types.js";
import { applyTxn, ensureWallet, InsufficientCreditError } from "./credit-wallet.js";
import { bookSlot } from "./zoom-pool.js";

/**
 * Peer-to-peer borrow request service.
 *
 * Flow thoả thuận khi mentor C muốn mượn Zoom của mentor A để dạy giờ B:
 *
 *   1. C tạo request (chọn slot có sẵn HOẶC đề xuất giờ tự do).
 *   2. A nhận inbox notification → 1 trong 3 action:
 *      - approve  → BE tự book, trừ credit C, cộng credit A theo earn rate
 *      - decline  → kết thúc
 *      - counter  → đề xuất credit/giờ khác, C confirm/reject
 *   3. C có thể cancel khi đang pending.
 *   4. Cron tick expire request quá 24h chưa reply.
 *
 * Production note: nên emit event để Notification/Zalo OA thông báo cho A.
 */

const REQUEST_TTL_HOURS = 24;
/** Cost mặc định khi C không offer (1 credit/phút) */
const DEFAULT_NOMINAL_PER_MIN = 1;

export class BorrowRequestError extends Error {
  constructor(public code: number, msg: string) {
    super(msg);
  }
}

export interface CreateBorrowRequestInput {
  fromTenantId: string;
  fromMentorId: string;
  /** Mentor A — owner Zoom muốn mượn */
  toMentorId: string;
  /** Slot cụ thể từ pool (optional) */
  slotId?: string;
  /** Hoặc đề xuất giờ tự do (bắt buộc nếu không có slotId) */
  proposedStartsAt?: string;
  durationMin?: number;
  courseTitle?: string;
  reason?: string;
  offeredCredits?: number;
  message?: string;
}

export function createBorrowRequest(input: CreateBorrowRequestInput): ZoomBorrowRequest {
  if (!input.slotId && !input.proposedStartsAt) {
    throw new BorrowRequestError(400, "Phải chọn slot hoặc đề xuất giờ");
  }

  let startsAt: string;
  let endsAt: string;
  let accountId: string | undefined;

  if (input.slotId) {
    const slot = db.zoomSlots.get(input.slotId);
    if (!slot) throw new BorrowRequestError(404, "Slot không tồn tại");
    if (slot.status !== "free") throw new BorrowRequestError(409, "Slot không còn rảnh");
    startsAt = slot.startsAt;
    endsAt = slot.endsAt;
    accountId = slot.accountId;
    // Verify owner of slot is target mentor (best effort)
    const acc = db.zoomPoolAccounts.get(slot.accountId);
    if (acc && acc.ownerType === "mentor" && acc.ownerId !== input.toMentorId) {
      throw new BorrowRequestError(400, "Slot không thuộc mentor này");
    }
  } else {
    const start = new Date(input.proposedStartsAt!);
    const dur = input.durationMin ?? 60;
    const end = new Date(start.getTime() + dur * 60_000);
    startsAt = start.toISOString();
    endsAt = end.toISOString();
  }

  const durationMin = Math.max(1, Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000));
  const offered = input.offeredCredits ?? durationMin * DEFAULT_NOMINAL_PER_MIN;

  // Pre-check balance — không trừ ngay (chỉ trừ khi A approve), nhưng cảnh báo sớm
  const wallet = ensureWallet(input.fromTenantId);
  if (wallet.balance < offered) {
    throw new InsufficientCreditError(offered, wallet.balance);
  }

  const expiresAt = new Date(Date.now() + REQUEST_TTL_HOURS * 3_600_000).toISOString();
  const req: ZoomBorrowRequest = {
    id: "BRQ-" + uuid().slice(0, 8),
    fromTenantId: input.fromTenantId,
    fromMentorId: input.fromMentorId,
    toTenantId: `TENANT-${input.toMentorId}`,
    toMentorId: input.toMentorId,
    accountId,
    slotId: input.slotId,
    proposedStartsAt: startsAt,
    proposedEndsAt: endsAt,
    courseTitle: input.courseTitle,
    reason: input.reason,
    offeredCredits: offered,
    message: input.message,
    status: "pending",
    expiresAt,
    createdAt: new Date().toISOString(),
  };
  db.zoomBorrowRequests.set(req.id, req);
  return req;
}

export function listInbox(toMentorId: string): ZoomBorrowRequest[] {
  return Array.from(db.zoomBorrowRequests.values())
    .filter((r) => r.toMentorId === toMentorId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listSent(fromMentorId: string): ZoomBorrowRequest[] {
  return Array.from(db.zoomBorrowRequests.values())
    .filter((r) => r.fromMentorId === fromMentorId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRequest(id: string): ZoomBorrowRequest | undefined {
  return db.zoomBorrowRequests.get(id);
}

/**
 * A approve → auto book, trừ credit C, cộng credit A.
 *
 * Nếu request có slotId → book slot đó.
 * Nếu không có slotId → BE generate ad-hoc slot trên pool account của A
 * (tạo ZoomPoolAccount nếu A chưa publish, status='available' với
 * contributorEarnRatePct=100 — A giữ toàn bộ credit vì peer-to-peer private).
 */
export function approveRequest(input: {
  requestId: string;
  byMentorId: string;
  responseMessage?: string;
}): { request: ZoomBorrowRequest; bookingId: string } {
  const req = db.zoomBorrowRequests.get(input.requestId);
  if (!req) throw new BorrowRequestError(404, "Request không tồn tại");
  if (req.status !== "pending") throw new BorrowRequestError(409, `Request đã ${req.status}`);
  if (req.toMentorId !== input.byMentorId) throw new BorrowRequestError(403, "Chỉ owner mới approve được");
  if (new Date(req.expiresAt) <= new Date()) {
    req.status = "expired";
    throw new BorrowRequestError(410, "Request đã hết hạn");
  }

  // Resolve effective values (counter-offer ưu tiên nếu có)
  const startsAt = req.counterStartsAt ?? req.proposedStartsAt;
  const endsAt = req.counterEndsAt ?? req.proposedEndsAt;
  const credits = req.counterCredits ?? req.offeredCredits;
  const durationMin = Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000);

  // Ensure 1 ZoomPoolAccount cho A (nếu chưa có) — peer-borrow private
  let accountId = req.accountId;
  if (!accountId) {
    const existing = Array.from(db.zoomPoolAccounts.values()).find(
      (a) => a.ownerType === "mentor" && a.ownerId === input.byMentorId,
    );
    if (existing) {
      accountId = existing.id;
    } else {
      const newAcc = {
        id: "ZA-" + uuid().slice(0, 8),
        ownerType: "mentor" as const,
        ownerId: input.byMentorId,
        zoomUserId: `peer-${input.byMentorId}`,
        zoomEmail: `${input.byMentorId}@peer.mentorhub.local`,
        zoomDisplayName: `Peer Zoom of ${input.byMentorId}`,
        licensed: durationMin > 40,
        maxConcurrent: 1,
        status: "available" as const,
        contributorEarnRatePct: 100,    // private peer-borrow → A giữ 100%
        joinedPoolAt: new Date().toISOString(),
      };
      db.zoomPoolAccounts.set(newAcc.id, newAcc);
      accountId = newAcc.id;
    }
  }

  // Tạo slot ad-hoc nếu chưa có slotId
  let slotId = req.slotId;
  if (!slotId) {
    const newSlot: ZoomSlot = {
      id: "ZS-" + uuid().slice(0, 8),
      accountId,
      startsAt,
      endsAt,
      status: "free",
    };
    db.zoomSlots.set(newSlot.id, newSlot);
    slotId = newSlot.id;
  }

  // Book — bookSlot lo trừ credit + cộng earn cho contributor
  let bookingResult;
  try {
    bookingResult = bookSlot({
      tenantId: req.fromTenantId,
      sessionId: `BRQ-${req.id}`,
      startsAt,
      durationMin,
      needLicensed: durationMin > 40,
      nominalCreditsOverride: credits,
      createdBy: req.fromMentorId,
    });
  } catch (e) {
    throw new BorrowRequestError(402, (e as Error).message);
  }

  req.status = "booked";
  req.bookingId = bookingResult.booking.id;
  req.respondedAt = new Date().toISOString();
  req.responseMessage = input.responseMessage;
  // Link booking back to request (audit trail)
  bookingResult.booking.fromBorrowRequestId = req.id;

  return { request: req, bookingId: bookingResult.booking.id };
}

export function declineRequest(input: {
  requestId: string;
  byMentorId: string;
  responseMessage?: string;
}): ZoomBorrowRequest {
  const req = db.zoomBorrowRequests.get(input.requestId);
  if (!req) throw new BorrowRequestError(404, "Request không tồn tại");
  if (req.status !== "pending") throw new BorrowRequestError(409, `Request đã ${req.status}`);
  if (req.toMentorId !== input.byMentorId) throw new BorrowRequestError(403, "Chỉ owner mới decline được");

  req.status = "declined";
  req.respondedAt = new Date().toISOString();
  req.responseMessage = input.responseMessage;
  return req;
}

/**
 * A đề xuất counter — request vẫn pending, C cần confirm bằng cách approve lại
 * (FE flow: C nhận thấy counter, click "đồng ý theo offer mới" → re-approve).
 */
export function counterOffer(input: {
  requestId: string;
  byMentorId: string;
  counterCredits?: number;
  counterStartsAt?: string;
  counterEndsAt?: string;
  responseMessage?: string;
}): ZoomBorrowRequest {
  const req = db.zoomBorrowRequests.get(input.requestId);
  if (!req) throw new BorrowRequestError(404, "Request không tồn tại");
  if (req.status !== "pending") throw new BorrowRequestError(409, `Request đã ${req.status}`);
  if (req.toMentorId !== input.byMentorId) throw new BorrowRequestError(403, "Chỉ owner mới counter được");

  if (input.counterCredits !== undefined) req.counterCredits = input.counterCredits;
  if (input.counterStartsAt) req.counterStartsAt = input.counterStartsAt;
  if (input.counterEndsAt) req.counterEndsAt = input.counterEndsAt;
  if (input.responseMessage) req.responseMessage = input.responseMessage;
  return req;
}

/** C huỷ request đang pending */
export function cancelRequest(input: { requestId: string; byMentorId: string }): ZoomBorrowRequest {
  const req = db.zoomBorrowRequests.get(input.requestId);
  if (!req) throw new BorrowRequestError(404, "Request không tồn tại");
  if (req.status !== "pending") throw new BorrowRequestError(409, `Request đã ${req.status}`);
  if (req.fromMentorId !== input.byMentorId) throw new BorrowRequestError(403, "Chỉ requester mới huỷ được");

  req.status = "cancelled";
  req.respondedAt = new Date().toISOString();
  return req;
}

/** Cron tick: expire request quá TTL chưa reply */
export function expirePendingRequests(now = new Date()): { expired: number } {
  let expired = 0;
  for (const req of db.zoomBorrowRequests.values()) {
    if (req.status === "pending" && new Date(req.expiresAt) <= now) {
      req.status = "expired";
      req.respondedAt = now.toISOString();
      expired++;
    }
  }
  return { expired };
}
