import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { db } from "../db/store.js";
import { PLANS } from "./subscription.js";

const router = Router();

router.use(requireAdmin);

// GET /admin/usage/platform
router.get("/usage/platform", (req, res) => {
  const { month: _month, plan: filterPlan } = req.query as { month?: string; plan?: string };

  const subs = Array.from(db.subscriptions.values());
  const filtered = subs.filter((s) => !filterPlan || s.plan === filterPlan);

  const byMentor = filtered.map((s) => {
    const logs = db.usageLogs.filter((l) => l.mentorId === s.mentorId);
    const whisperCostUSD = logs.filter((l) => l.step === "whisper").reduce((sum, l) => sum + l.costUSD, 0);
    const claudeCostUSD = logs.filter((l) => l.step === "claude").reduce((sum, l) => sum + l.costUSD, 0);
    const storageUSD = logs.filter((l) => l.step === "storage").reduce((sum, l) => sum + l.costUSD, 0);
    const totalCostUSD = whisperCostUSD + claudeCostUSD + storageUSD;

    const plan = PLANS.find((p) => p.id === s.plan);
    const revenueVND = s.status === "active" && plan ? plan.monthlyPriceVND : 0;
    const marginPct = revenueVND > 0 ? ((revenueVND - totalCostUSD * 25_000) / revenueVND) * 100 : 0;

    return {
      mentorId: s.mentorId,
      mentorName: s.mentorId, // TODO: join mentor profile
      plan: s.plan,
      sessions: s.usage.aiSessionsUsed,
      whisperCostUSD, claudeCostUSD, storageUSD, totalCostUSD,
      revenueVND, marginPct,
      status: s.status,
    };
  });

  const summary = {
    totalMentors: filtered.length,
    activeMentors: filtered.filter((s) => s.status === "active").length,
    trialMentors: filtered.filter((s) => s.status === "trial").length,
    totalSessions: filtered.reduce((sum, s) => sum + s.usage.aiSessionsUsed, 0),
    totalCostUSD: byMentor.reduce((sum, m) => sum + m.totalCostUSD, 0),
    totalRevenueVND: byMentor.reduce((sum, m) => sum + m.revenueVND, 0),
    grossMarginPct: 0,
  };
  summary.grossMarginPct = summary.totalRevenueVND > 0
    ? ((summary.totalRevenueVND - summary.totalCostUSD * 25_000) / summary.totalRevenueVND) * 100
    : 0;

  res.json({ summary, byMentor });
});

// GET /admin/alerts
router.get("/alerts", (_req, res) => {
  const alerts: Array<{ type: string; mentorId: string; severity: string; message: string; action?: { label: string; url: string } }> = [];

  for (const sub of db.subscriptions.values()) {
    const quotas: Record<string, number> = { trial: 5, starter: 5, pro: 20, unlimited: 100 };
    const limit = quotas[sub.plan] ?? 100;
    if (limit > 0) {
      const pct = (sub.usage.aiSessionsUsed / limit) * 100;
      if (pct >= 100) {
        alerts.push({ type: "quota_exceeded", mentorId: sub.mentorId, severity: "critical", message: `Đã vượt ${sub.usage.aiSessionsUsed}/${limit} buổi AI` });
      } else if (pct >= 80) {
        alerts.push({ type: "quota_near", mentorId: sub.mentorId, severity: "warning", message: `${sub.usage.aiSessionsUsed}/${limit} buổi AI (${pct.toFixed(0)}%)` });
      }
    }

    if (sub.plan === "trial" && sub.trialEndsAt) {
      const daysLeft = Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / 86400_000);
      if (daysLeft <= 3 && daysLeft > 0) {
        alerts.push({ type: "trial_ending", mentorId: sub.mentorId, severity: "warning", message: `Trial còn ${daysLeft} ngày` });
      }
    }
  }

  res.json(alerts);
});

export default router;
