import { Router } from "express";
import { db } from "../db/store.js";

const router = Router();

// GET /usage/mentor/:mentorId
router.get("/mentor/:mentorId", (req, res) => {
  const sub = db.subscriptions.get(req.params.mentorId);
  if (!sub) return res.status(404).json({ error: "No subscription" });

  const planQuotas: Record<string, { aiSessions: number; zalo: number; storageMB: number; courses: number; students: number }> = {
    trial:     { aiSessions: 5,   zalo: 100,  storageMB: 5 * 1024,   courses: 2,  students: 20 },
    starter:   { aiSessions: 5,   zalo: 500,  storageMB: 10 * 1024,  courses: 3,  students: 50 },
    pro:       { aiSessions: 20,  zalo: 2000, storageMB: 50 * 1024,  courses: 10, students: 500 },
    unlimited: { aiSessions: 100, zalo: -1,   storageMB: 500 * 1024, courses: -1, students: -1 },
  };
  const q = planQuotas[sub.plan];

  res.json({
    aiSessionsUsed: sub.usage.aiSessionsUsed,
    aiSessionsQuota: q.aiSessions,
    zaloSent: sub.usage.zaloSent,
    zaloQuota: q.zalo,
    storageUsedMB: sub.usage.storageUsedMB,
    storageQuotaMB: q.storageMB,
    coursesActive: sub.usage.coursesActive,
    coursesLimit: q.courses,
    studentsActive: sub.usage.studentsActive,
    studentsLimit: q.students,
  });
});

export default router;
