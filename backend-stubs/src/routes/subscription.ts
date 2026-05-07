import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db/store.js";
import { config } from "../config.js";
import { PLANS as REGISTRY_PLANS, CYCLES, computeCyclePrice, getPlan } from "../config/plans.js";
import type { TenantTier } from "../config/models.js";
import { mapLegacyPlanToTier } from "../middleware/quota.js";
import { buildVnpayUrl, verifyVnpaySignature } from "../services/vnpay.js";
import { upgradeSubscription } from "../services/subscription-lifecycle.js";

const router = Router();

/**
 * Legacy 3-plan PLANS export — giữ cho admin.ts/transcribe.ts đang import.
 * Pricing thì derive từ registry; nếu null (TBD) → 0.
 *
 * Sau Phase 3 sẽ rip out hẳn export này, callers chuyển sang dùng config/plans.ts.
 */
export const PLANS = REGISTRY_PLANS
  .filter((p) => !p.isTrial && !p.isFree)
  .map((p) => ({
    id: p.id,
    name: p.displayName,
    tagline: p.tagline,
    monthlyPriceVND: p.monthlyPriceVND ?? 0,
    popular: p.popular ?? false,
    highlights: p.highlights,
    features: {
      aiSessions: p.quota.aiEvaluationsPerMonth,
      zaloMessages: p.quota.zaloMessagesPerMonth,
      storageGB: p.quota.storageGB,
      coursesLimit: p.quota.coursesLimit,
      studentsLimit: p.quota.studentsLimit,
      aiModel: p.id === "starter" ? "haiku" : p.id === "pro" ? "haiku" : "sonnet",
      customBranding: p.features.customBranding,
      apiAccess: p.features.apiAccess,
      prioritySupport: p.features.prioritySupport,
    },
  }));

const CYCLE_MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, semiannual: 6, yearly: 12 };

// GET /subscription/plans — trả full 6-tier registry
router.get("/plans", (_req, res) => {
  res.json({
    plans: REGISTRY_PLANS,
    cycles: CYCLES,
  });
});

// GET /subscription/mentor/:mentorId
router.get("/mentor/:mentorId", (req, res) => {
  const sub = db.subscriptions.get(req.params.mentorId);
  if (!sub) return res.status(404).json({ error: "No subscription" });
  res.json({
    ...sub,
    tier: mapLegacyPlanToTier(sub.plan),
  });
});

// POST /subscription/mentor/:mentorId/upgrade
const upgradeSchema = z.object({
  // Cho phép cả TenantTier mới (6) lẫn legacy PlanId (4)
  plan: z.enum(["trial", "free", "starter", "pro", "master", "academy", "unlimited"]),
  cycle: z.enum(["monthly", "quarterly", "semiannual", "yearly"]),
  paymentMethod: z.enum(["vnpay", "bank_transfer", "credit_card", "zalopay"]).optional().default("vnpay"),
});
router.post("/mentor/:mentorId/upgrade", (req, res) => {
  const body = upgradeSchema.parse(req.body);
  const tier = mapLegacyPlanToTier(body.plan as TenantTier);
  const plan = getPlan(tier);

  if (plan.isFree || plan.isTrial) {
    return res.status(400).json({ error: "Không thể upgrade vào tier free/trial" });
  }
  if (plan.monthlyPriceVND == null) {
    return res.status(400).json({
      error: "Plan chưa có giá công khai — liên hệ sales",
      tier: plan.id,
    });
  }

  const months = CYCLE_MONTHS[body.cycle];
  const { total } = computeCyclePrice(plan.monthlyPriceVND, body.cycle);
  const now = new Date();
  const end = new Date(now); end.setMonth(end.getMonth() + months);

  const invoiceId = "INV-" + Date.now();
  const invoice = {
    id: invoiceId,
    mentorId: req.params.mentorId,
    issuedAt: now.toISOString().split("T")[0],
    periodLabel: `${now.toLocaleDateString("vi-VN")} → ${end.toLocaleDateString("vi-VN")}`,
    plan: tier as Exclude<TenantTier, "trial" | "free">,
    cycle: body.cycle as "monthly" | "quarterly" | "semiannual" | "yearly",
    amountVND: total!,
    status: "pending" as const,
    method: (body.paymentMethod === "zalopay" ? "ZaloPay" : body.paymentMethod === "bank_transfer" ? "Bank transfer" : body.paymentMethod === "credit_card" ? "Credit card" : "VNPay") as "VNPay" | "Bank transfer" | "Credit card" | "ZaloPay",
  };
  db.invoices.set(invoiceId, invoice);

  const paymentRedirectUrl = body.paymentMethod === "vnpay"
    ? buildVnpayUrl({ invoiceId, amountVND: total! })
    : `${config.vnpay.returnUrl}&method=${body.paymentMethod}&invoice=${invoiceId}`;

  res.json({ invoice, paymentRedirectUrl });
});

// POST /subscription/mentor/:mentorId/cancel-renewal
router.post("/mentor/:mentorId/cancel-renewal", (req, res) => {
  const sub = db.subscriptions.get(req.params.mentorId);
  if (!sub) return res.status(404).json({ error: "No subscription" });
  sub.status = "canceled_at_period_end";
  sub.autoRenew = false;
  sub.nextBillingAt = null;
  sub.nextBillingAmountVND = undefined;
  res.json(sub);
});

// POST /subscription/mentor/:mentorId/resume-renewal
router.post("/mentor/:mentorId/resume-renewal", (req, res) => {
  const sub = db.subscriptions.get(req.params.mentorId);
  if (!sub) return res.status(404).json({ error: "No subscription" });
  if (sub.status !== "canceled_at_period_end") return res.status(400).json({ error: "Not in canceled state" });

  const tier = mapLegacyPlanToTier(sub.plan);
  const plan = getPlan(tier);
  if (plan.monthlyPriceVND != null) {
    const { total } = computeCyclePrice(plan.monthlyPriceVND, sub.cycle);
    sub.nextBillingAmountVND = total!;
  }
  sub.status = "active";
  sub.autoRenew = true;
  sub.nextBillingAt = sub.currentPeriodEnd;
  res.json(sub);
});

// GET /subscription/mentor/:mentorId/invoices
router.get("/mentor/:mentorId/invoices", (req, res) => {
  const invoices = Array.from(db.invoices.values())
    .filter((iv) => iv.mentorId === req.params.mentorId)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  res.json(invoices);
});

// POST /subscription/admin/invoice/:id/mark-paid — bank-transfer manual confirm
router.post("/admin/invoice/:id/mark-paid", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Admin token required" });
  const invoice = db.invoices.get(req.params.id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  if (invoice.status === "paid") return res.json({ ok: true, alreadyPaid: true });
  invoice.status = "paid";
  upgradeSubscription(invoice.mentorId, invoice.plan as TenantTier, invoice.cycle, invoice.amountVND);
  res.json({ ok: true, invoice });
});

// ── VNPay webhook (mounted at /webhook/vnpay) ────────────────────────────────
export function vnpayWebhookHandler(req: Request, res: Response) {
  const params = req.body as Record<string, string>;
  if (!verifyVnpaySignature(params)) {
    return res.json({ RspCode: "97", Message: "Invalid signature" });
  }
  const invoice = db.invoices.get(params.vnp_TxnRef!);
  if (!invoice) return res.json({ RspCode: "01", Message: "Invoice not found" });

  if (params.vnp_ResponseCode === "00") {
    invoice.status = "paid";
    upgradeSubscription(invoice.mentorId, invoice.plan as TenantTier, invoice.cycle, invoice.amountVND);
  } else {
    invoice.status = "failed";
  }
  res.json({ RspCode: "00", Message: "Confirm Success" });
}

export default router;
