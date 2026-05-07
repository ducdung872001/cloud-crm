import { Router } from "express";
import { z } from "zod";
import { findFreeSlots, bookSlot, cancelBooking, listBookings, runPoolScanner } from "../services/zoom-pool.js";
import {
  createBorrowRequest, listInbox, listSent, getRequest,
  approveRequest, declineRequest, counterOffer, cancelRequest,
  expirePendingRequests,
} from "../services/zoom-borrow.js";
import { db } from "../db/store.js";
import { v4 as uuid } from "uuid";

const router = Router();

function tenantOf(mentorId: string) {
  return `TENANT-${mentorId}`;
}

// GET /zoom-pool/slots?notBefore=ISO&durationMin=60
router.get("/slots", (req, res) => {
  const { notBefore, notAfter, preferLicensed } = req.query as Record<string, string>;
  const slots = findFreeSlots({
    notBefore: notBefore ? new Date(notBefore) : undefined,
    notAfter: notAfter ? new Date(notAfter) : undefined,
    preferLicensed: preferLicensed === "true",
  });
  // enrich với account owner info để FE hiển thị tên người cho mượn
  const enriched = slots.map((s) => {
    const acc = db.zoomPoolAccounts.get(s.accountId);
    return {
      ...s,
      account: acc ? {
        id: acc.id,
        ownerType: acc.ownerType,
        ownerId: acc.ownerId,
        licensed: acc.licensed,
        contributorEarnRatePct: acc.contributorEarnRatePct,
        zoomDisplayName: acc.zoomDisplayName,
      } : null,
    };
  });
  res.json(enriched);
});

// GET /zoom-pool/accounts — list accounts public info
router.get("/accounts", (_req, res) => {
  const out = Array.from(db.zoomPoolAccounts.values()).map((a) => ({
    id: a.id,
    ownerType: a.ownerType,
    ownerId: a.ownerId,
    licensed: a.licensed,
    status: a.status,
    contributorEarnRatePct: a.contributorEarnRatePct,
    joinedPoolAt: a.joinedPoolAt,
    zoomDisplayName: a.zoomDisplayName,
  }));
  res.json(out);
});

// GET /zoom-pool/my-accounts — chỉ accounts của mentor đang đăng nhập
router.get("/my-accounts", (req, res) => {
  const out = Array.from(db.zoomPoolAccounts.values())
    .filter((a) => a.ownerType === "mentor" && a.ownerId === req.mentorId)
    .map((a) => ({ ...a }));
  res.json(out);
});

// POST /zoom-pool/my-accounts — publish 1 account của mentor lên pool (auto-pool flow)
const publishSchema = z.object({
  zoomEmail: z.string().email().optional(),
  zoomDisplayName: z.string().optional(),
  licensed: z.boolean(),
  maxConcurrent: z.number().int().positive().default(1),
  contributorEarnRatePct: z.number().min(0).max(100),
});
router.post("/my-accounts", (req, res) => {
  const body = publishSchema.parse(req.body);
  const id = "ZA-" + uuid().slice(0, 8);
  const account = {
    id,
    ownerType: "mentor" as const,
    ownerId: req.mentorId,
    zoomUserId: `pub-${req.mentorId}`,
    zoomEmail: body.zoomEmail ?? `${req.mentorId}@mentorhub.local`,
    zoomDisplayName: body.zoomDisplayName,
    licensed: body.licensed,
    maxConcurrent: body.maxConcurrent,
    status: "available" as const,
    contributorEarnRatePct: body.contributorEarnRatePct,
    joinedPoolAt: new Date().toISOString(),
  };
  db.zoomPoolAccounts.set(id, account);
  res.status(201).json(account);
});

// PATCH /zoom-pool/my-accounts/:id — update earn rate / status
const accountPatchSchema = z.object({
  contributorEarnRatePct: z.number().min(0).max(100).optional(),
  status: z.enum(["available", "in_use", "blocked", "expired"]).optional(),
  zoomDisplayName: z.string().optional(),
  licensed: z.boolean().optional(),
});
router.patch("/my-accounts/:id", (req, res) => {
  const acc = db.zoomPoolAccounts.get(req.params.id);
  if (!acc) return res.status(404).json({ error: "Account không tồn tại" });
  if (acc.ownerType !== "mentor" || acc.ownerId !== req.mentorId) {
    return res.status(403).json({ error: "Không phải owner" });
  }
  Object.assign(acc, accountPatchSchema.parse(req.body));
  res.json(acc);
});

// POST /zoom-pool/my-accounts/:id/slots — manually add 1 slot
const addSlotSchema = z.object({
  startsAt: z.string(),
  endsAt: z.string(),
});
router.post("/my-accounts/:id/slots", (req, res) => {
  const acc = db.zoomPoolAccounts.get(req.params.id);
  if (!acc) return res.status(404).json({ error: "Account không tồn tại" });
  if (acc.ownerType !== "mentor" || acc.ownerId !== req.mentorId) {
    return res.status(403).json({ error: "Không phải owner" });
  }
  const body = addSlotSchema.parse(req.body);
  const slot = {
    id: "ZS-" + uuid().slice(0, 8),
    accountId: acc.id,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    status: "free" as const,
  };
  db.zoomSlots.set(slot.id, slot);
  res.status(201).json(slot);
});

// GET /zoom-pool/my-accounts/:id/slots — list slots của account
router.get("/my-accounts/:id/slots", (req, res) => {
  const acc = db.zoomPoolAccounts.get(req.params.id);
  if (!acc) return res.status(404).json({ error: "Account không tồn tại" });
  if (acc.ownerType !== "mentor" || acc.ownerId !== req.mentorId) {
    return res.status(403).json({ error: "Không phải owner" });
  }
  const slots = Array.from(db.zoomSlots.values())
    .filter((s) => s.accountId === acc.id)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  res.json(slots);
});

// POST /zoom-pool/book
const bookSchema = z.object({
  sessionId: z.string(),
  startsAt: z.string(),
  durationMin: z.number().int().positive().optional(),
  needLicensed: z.boolean().optional(),
});
router.post("/book", (req, res) => {
  const body = bookSchema.parse(req.body);
  try {
    const result = bookSlot({
      tenantId: tenantOf(req.mentorId),
      createdBy: req.mentorId,
      ...body,
    });
    res.status(201).json(result);
  } catch (e) {
    const err = e as Error & { code?: number };
    res.status(err.code ?? 400).json({ error: err.message });
  }
});

// DELETE /zoom-pool/bookings/:id
router.delete("/bookings/:id", (req, res) => {
  const reason = (req.query.reason as string) ?? "user_cancelled";
  try {
    res.json(cancelBooking({ bookingId: req.params.id, reason, cancelledBy: req.mentorId }));
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

// GET /zoom-pool/bookings?status=active
router.get("/bookings", (req, res) => {
  res.json(listBookings(tenantOf(req.mentorId), {
    status: req.query.status as never,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  }));
});

// ── Peer-to-peer borrow request ────────────────────────────────────────────

const borrowCreateSchema = z.object({
  toMentorId: z.string(),
  slotId: z.string().optional(),
  proposedStartsAt: z.string().optional(),
  durationMin: z.number().int().positive().optional(),
  courseTitle: z.string().optional(),
  reason: z.string().optional(),
  offeredCredits: z.number().int().positive().optional(),
  message: z.string().optional(),
});

// POST /zoom-pool/borrow — C tạo yêu cầu mượn
router.post("/borrow", (req, res) => {
  const body = borrowCreateSchema.parse(req.body);
  try {
    const created = createBorrowRequest({
      fromTenantId: tenantOf(req.mentorId),
      fromMentorId: req.mentorId,
      ...body,
    });
    res.status(201).json(created);
  } catch (e) {
    const err = e as Error & { code?: number };
    res.status(err.code ?? 400).json({ error: err.message });
  }
});

// GET /zoom-pool/borrow/inbox — A xem yêu cầu nhận được
router.get("/borrow/inbox", (req, res) => {
  res.json(listInbox(req.mentorId));
});

// GET /zoom-pool/borrow/sent — C xem yêu cầu đã gửi
router.get("/borrow/sent", (req, res) => {
  res.json(listSent(req.mentorId));
});

// GET /zoom-pool/borrow/:id
router.get("/borrow/:id", (req, res) => {
  const r = getRequest(req.params.id);
  if (!r) return res.status(404).json({ error: "Request không tồn tại" });
  if (r.fromMentorId !== req.mentorId && r.toMentorId !== req.mentorId) {
    return res.status(403).json({ error: "Không có quyền xem" });
  }
  res.json(r);
});

// POST /zoom-pool/borrow/:id/approve — A chấp nhận → auto book
const approveSchema = z.object({ responseMessage: z.string().optional() });
router.post("/borrow/:id/approve", (req, res) => {
  try {
    const r = approveRequest({
      requestId: req.params.id,
      byMentorId: req.mentorId,
      responseMessage: approveSchema.parse(req.body).responseMessage,
    });
    res.json(r);
  } catch (e) {
    const err = e as Error & { code?: number };
    res.status(err.code ?? 400).json({ error: err.message });
  }
});

// POST /zoom-pool/borrow/:id/decline
router.post("/borrow/:id/decline", (req, res) => {
  try {
    const r = declineRequest({
      requestId: req.params.id,
      byMentorId: req.mentorId,
      responseMessage: req.body?.responseMessage,
    });
    res.json(r);
  } catch (e) {
    const err = e as Error & { code?: number };
    res.status(err.code ?? 400).json({ error: err.message });
  }
});

// POST /zoom-pool/borrow/:id/counter
const counterSchema = z.object({
  counterCredits: z.number().int().positive().optional(),
  counterStartsAt: z.string().optional(),
  counterEndsAt: z.string().optional(),
  responseMessage: z.string().optional(),
});
router.post("/borrow/:id/counter", (req, res) => {
  try {
    const r = counterOffer({
      requestId: req.params.id,
      byMentorId: req.mentorId,
      ...counterSchema.parse(req.body),
    });
    res.json(r);
  } catch (e) {
    const err = e as Error & { code?: number };
    res.status(err.code ?? 400).json({ error: err.message });
  }
});

// POST /zoom-pool/borrow/:id/cancel — C huỷ
router.post("/borrow/:id/cancel", (req, res) => {
  try {
    const r = cancelRequest({ requestId: req.params.id, byMentorId: req.mentorId });
    res.json(r);
  } catch (e) {
    const err = e as Error & { code?: number };
    res.status(err.code ?? 400).json({ error: err.message });
  }
});

// POST /zoom-pool/admin/scan — manual scanner trigger (testing)
router.post("/admin/scan", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Admin token required" });
  res.json({ scan: runPoolScanner(), expire: expirePendingRequests() });
});

export default router;
