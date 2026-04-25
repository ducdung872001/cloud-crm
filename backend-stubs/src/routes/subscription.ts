import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db/store.js";
import { config } from "../config.js";

const router = Router();

// Plans — giữ đồng bộ với FE mocks/subscription.ts
export const PLANS = [
  { id: "starter", name: "Starter", tagline: "Bắt đầu dạy chuyên nghiệp.", monthlyPriceVND: 99_000, features: { aiSessions: 5, zaloMessages: 500, storageGB: 10, coursesLimit: 3, studentsLimit: 50, aiModel: "haiku", customBranding: false, apiAccess: false, prioritySupport: false } },
  { id: "pro", name: "Pro", tagline: "Cho mentor đã có học viên đều.", monthlyPriceVND: 299_000, popular: true, features: { aiSessions: 20, zaloMessages: 2_000, storageGB: 50, coursesLimit: 10, studentsLimit: 500, aiModel: "haiku", customBranding: true, apiAccess: false, prioritySupport: true } },
  { id: "unlimited", name: "Unlimited", tagline: "Mentor scale — không giới hạn.", monthlyPriceVND: 899_000, features: { aiSessions: 100, zaloMessages: -1, storageGB: 500, coursesLimit: -1, studentsLimit: -1, aiModel: "sonnet", customBranding: true, apiAccess: true, prioritySupport: true } },
];

const CYCLE_MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, semiannual: 6, yearly: 12 };
const CYCLE_DISCOUNT: Record<string, number> = { monthly: 0, quarterly: 5, semiannual: 10, yearly: 20 };

// GET /subscription/plans
router.get("/plans", (_req, res) => res.json(PLANS));

// GET /subscription/mentor/:mentorId
router.get("/mentor/:mentorId", (req, res) => {
  const sub = db.subscriptions.get(req.params.mentorId);
  if (!sub) return res.status(404).json({ error: "No subscription" });
  res.json(sub);
});

// POST /subscription/mentor/:mentorId/upgrade
const upgradeSchema = z.object({
  plan: z.enum(["starter", "pro", "unlimited"]),
  cycle: z.enum(["monthly", "quarterly", "semiannual", "yearly"]),
  paymentMethod: z.enum(["vnpay", "bank_transfer", "credit_card", "zalopay"]).optional().default("vnpay"),
});
router.post("/mentor/:mentorId/upgrade", (req, res) => {
  const body = upgradeSchema.parse(req.body);
  const plan = PLANS.find((p) => p.id === body.plan)!;
  const months = CYCLE_MONTHS[body.cycle];
  const discount = CYCLE_DISCOUNT[body.cycle];
  const gross = plan.monthlyPriceVND * months;
  const total = Math.round(gross * (1 - discount / 100));

  const now = new Date();
  const end = new Date(now); end.setMonth(end.getMonth() + months);

  // Create invoice
  const invoiceId = "INV-" + Date.now();
  const invoice = {
    id: invoiceId,
    mentorId: req.params.mentorId,
    issuedAt: now.toISOString().split("T")[0],
    periodLabel: `${now.toLocaleDateString("vi-VN")} → ${end.toLocaleDateString("vi-VN")}`,
    plan: body.plan as "starter" | "pro" | "unlimited",
    cycle: body.cycle as "monthly" | "quarterly" | "semiannual" | "yearly",
    amountVND: total,
    status: "pending" as const,
    method: (body.paymentMethod === "zalopay" ? "ZaloPay" : body.paymentMethod === "bank_transfer" ? "Bank transfer" : body.paymentMethod === "credit_card" ? "Credit card" : "VNPay") as "VNPay" | "Bank transfer" | "Credit card" | "ZaloPay",
  };
  db.invoices.set(invoiceId, invoice);

  // Build payment redirect URL (mock — production: gọi VNPay SDK)
  const paymentRedirectUrl = body.paymentMethod === "vnpay"
    ? buildVnpayUrl(invoice)
    : body.paymentMethod === "bank_transfer"
    ? `${config.vnpay.returnUrl}&method=bank&invoice=${invoiceId}`
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

  const plan = PLANS.find((p) => p.id === sub.plan);
  if (plan) {
    const months = CYCLE_MONTHS[sub.cycle];
    const discount = CYCLE_DISCOUNT[sub.cycle];
    sub.nextBillingAmountVND = Math.round(plan.monthlyPriceVND * months * (1 - discount / 100));
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

// ── VNPay webhook (mounted at /webhook/vnpay) ────────────────────────────────
export function vnpayWebhookHandler(req: Request, res: Response) {
  // TODO: verify signature với VNPAY_HASH_SECRET
  const { vnp_TxnRef, vnp_ResponseCode } = req.body;
  const invoice = db.invoices.get(vnp_TxnRef);
  if (!invoice) return res.json({ RspCode: "01", Message: "Invoice not found" });

  if (vnp_ResponseCode === "00") {
    invoice.status = "paid";
    // Activate subscription
    const sub = db.subscriptions.get(invoice.mentorId);
    if (sub) {
      const months = CYCLE_MONTHS[invoice.cycle];
      const periodEnd = new Date(); periodEnd.setMonth(periodEnd.getMonth() + months);
      sub.plan = invoice.plan;
      sub.status = "active";
      sub.cycle = invoice.cycle;
      sub.currentPeriodStart = new Date().toISOString();
      sub.currentPeriodEnd = periodEnd.toISOString();
      sub.nextBillingAt = periodEnd.toISOString();
      sub.nextBillingAmountVND = invoice.amountVND;
      sub.autoRenew = true;
      sub.trialStartedAt = undefined;
      sub.trialEndsAt = undefined;
    }
  } else {
    invoice.status = "failed";
  }
  res.json({ RspCode: "00", Message: "Confirm Success" });
}

function buildVnpayUrl(invoice: { id: string; amountVND: number }): string {
  // Mock — production: SHA256 sign + full VNPay params
  return `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?` +
    `vnp_TmnCode=${config.vnpay.tmnCode}` +
    `&vnp_Amount=${invoice.amountVND * 100}` +
    `&vnp_TxnRef=${invoice.id}` +
    `&vnp_ReturnUrl=${encodeURIComponent(config.vnpay.returnUrl)}` +
    `&vnp_SecureHash=MOCKSIGNATURE`;
}

export default router;
