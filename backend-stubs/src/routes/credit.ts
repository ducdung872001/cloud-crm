import { Router } from "express";
import { z } from "zod";
import {
  getBalance, listTransactions, getRules, setRules, applyTxn, runMonthlyGrant,
} from "../services/credit-wallet.js";
import { reconcile } from "../services/credit-reconcile.js";

const router = Router();

function tenantOf(mentorId: string) {
  return `TENANT-${mentorId}`;
}

// GET /credit/wallet
router.get("/wallet", (req, res) => {
  res.json(getBalance(tenantOf(req.mentorId)));
});

// GET /credit/transactions?type=spend&limit=50
router.get("/transactions", (req, res) => {
  const type = req.query.type as never;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  res.json(listTransactions(tenantOf(req.mentorId), { type, limit }));
});

// GET /credit/rules — read tenant config
router.get("/rules", (req, res) => {
  const rules = getRules(tenantOf(req.mentorId));
  if (!rules) return res.status(404).json({ error: "No rules set" });
  res.json(rules);
});

// PUT /credit/rules — admin update
const rulesSchema = z.object({
  monthlyGrant: z.number().min(0).optional(),
  swapRatePct: z.number().min(0).max(100).optional(),
  rolloverEnabled: z.boolean().optional(),
  rolloverCap: z.number().min(-1).optional(),
  tierDiscountPct: z.number().min(0).max(100).optional(),
  earnRules: z.array(z.object({
    source: z.enum(["refer_mentor", "contribute_pool", "complete_course", "community_review"]),
    creditPerEvent: z.number().min(0),
    enabled: z.boolean(),
  })).optional(),
});
router.put("/rules", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Admin token required" });
  const body = rulesSchema.parse(req.body);
  res.json(setRules(tenantOf(req.mentorId), body, req.mentorId));
});

// POST /credit/admin/grant — manual grant (test/promo)
const grantSchema = z.object({
  amount: z.number().int().positive(),
  reason: z.string().min(1),
});
router.post("/admin/grant", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Admin token required" });
  const body = grantSchema.parse(req.body);
  const txn = applyTxn({
    tenantId: tenantOf(req.mentorId),
    type: "adjust",
    amount: body.amount,
    reason: body.reason,
    createdBy: req.mentorId,
  });
  res.status(201).json(txn);
});

// POST /credit/admin/run-monthly-grant — chạy thủ công cron tick (testing)
router.post("/admin/run-monthly-grant", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Admin token required" });
  res.json(runMonthlyGrant());
});

// GET /credit/admin/reconcile?period=YYYY-MM
router.get("/admin/reconcile", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Admin token required" });
  const period = req.query.period as string | undefined;
  res.json(reconcile(period));
});

export default router;
