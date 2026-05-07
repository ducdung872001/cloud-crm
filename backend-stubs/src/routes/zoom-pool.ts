import { Router } from "express";
import { z } from "zod";
import { findFreeSlots, bookSlot, cancelBooking, listBookings, runPoolScanner } from "../services/zoom-pool.js";
import { db } from "../db/store.js";

const router = Router();

function tenantOf(mentorId: string) {
  return `TENANT-${mentorId}`;
}

// GET /zoom-pool/slots?notBefore=ISO&durationMin=60
router.get("/slots", (req, res) => {
  const { notBefore, notAfter, preferLicensed } = req.query as Record<string, string>;
  res.json(findFreeSlots({
    notBefore: notBefore ? new Date(notBefore) : undefined,
    notAfter: notAfter ? new Date(notAfter) : undefined,
    preferLicensed: preferLicensed === "true",
  }));
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
  }));
  res.json(out);
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

// POST /zoom-pool/admin/scan — manual scanner trigger (testing)
router.post("/admin/scan", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Admin token required" });
  res.json(runPoolScanner());
});

export default router;
