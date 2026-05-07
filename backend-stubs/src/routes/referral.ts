import { Router } from "express";
import { z } from "zod";
import {
  createLink, listLinks, deactivateLink, trackClick, linkSignup, markConverted, markPaidOut,
  statsFor, lookupCode, getCommissionRule, setCommissionRule,
} from "../services/referral.js";

const router = Router();

function tenantOf(mentorId: string) {
  return `TENANT-${mentorId}`;
}

// Mentor manage links
router.get("/links", (req, res) => {
  res.json(listLinks(req.mentorId));
});

const createSchema = z.object({
  code: z.string().min(3).max(20).optional(),
  campaign: z.string().optional(),
});
router.post("/links", (req, res) => {
  const body = createSchema.parse(req.body);
  try {
    res.status(201).json(createLink({ ownerMentorId: req.mentorId, tenantId: tenantOf(req.mentorId), ...body }));
  } catch (e) {
    const err = e as Error & { code?: number };
    res.status(err.code ?? 400).json({ error: err.message });
  }
});

router.delete("/links/:id", (req, res) => {
  res.status(deactivateLink(req.params.id) ? 204 : 404).end();
});

router.get("/stats", (req, res) => {
  res.json(statsFor(req.mentorId));
});

// Public lookup (FE attribution flow)
router.get("/public/lookup/:code", (req, res) => {
  const r = lookupCode(req.params.code);
  if (!r) return res.status(404).json({ error: "Code không hợp lệ" });
  res.json(r);
});

// Tracking endpoints (FE/landing page gọi)
router.post("/public/track-click", (req, res) => {
  const code = (req.body?.code as string) ?? "";
  const attr = trackClick(code);
  if (!attr) return res.status(404).json({ error: "Code không hợp lệ" });
  res.status(201).json(attr);
});

const signupSchema = z.object({
  attributionId: z.string(),
  refereeMentorId: z.string(),
});
router.post("/internal/signup", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Internal only" });
  const body = signupSchema.parse(req.body);
  try {
    res.json(linkSignup(body.attributionId, body.refereeMentorId, tenantOf(body.refereeMentorId)));
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

const convertSchema = z.object({
  attributionId: z.string(),
  plan: z.enum(["starter", "pro", "master", "academy"]),
  amountVND: z.number().int().positive(),
});
router.post("/internal/convert", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Internal only" });
  const body = convertSchema.parse(req.body);
  try {
    res.json(markConverted(body));
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

const paidOutSchema = z.object({
  attributionId: z.string(),
  payoutInvoiceId: z.string(),
});
router.post("/internal/payout", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Internal only" });
  const body = paidOutSchema.parse(req.body);
  try {
    res.json(markPaidOut(body.attributionId, body.payoutInvoiceId));
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// Commission rule (admin)
router.get("/admin/rules/:tenantId", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Admin only" });
  const rule = getCommissionRule(req.params.tenantId);
  if (!rule) return res.status(404).json({ error: "No rule" });
  res.json(rule);
});

const ruleSchema = z.object({
  ratesByPlan: z.record(z.string(), z.number().min(0).max(100)).optional(),
  recurring: z.boolean().optional(),
  maxRecurringMonths: z.number().int().min(0).optional(),
  minPayoutVND: z.number().int().min(0).optional(),
});
router.put("/admin/rules/:tenantId", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Admin only" });
  res.json(setCommissionRule(req.params.tenantId, ruleSchema.parse(req.body)));
});

export default router;
