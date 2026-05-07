import { Router } from "express";
import { z } from "zod";
import { runPerStudentBreakdown } from "../services/per-student-breakdown.js";
import { requireQuota, recordUsage, getCurrentTier } from "../middleware/quota.js";

const router = Router();

const StudentInputSchema = z.object({
  studentId: z.string(),
  name: z.string(),
  attendanceStatus: z.enum(["present", "late", "absent"]).optional(),
  talkTimeMin: z.number().optional(),
  questionsAsked: z.number().optional(),
  chatMessages: z.number().optional(),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  transcriptExcerpt: z.string().optional(),
});

const BreakdownReqSchema = z.object({
  transcript: z.string(),
  courseName: z.string(),
  sessionNumber: z.number().int(),
  sessionTitle: z.string(),
  students: z.array(StudentInputSchema).min(1),
  model: z.string().optional(),
  promptVersion: z.string().optional(),
  sessionId: z.string().optional(),
});

// POST /per-student-breakdown
// Quota: 1 call = N students (cost = N students)
router.post(
  "/",
  // Cost dynamic theo body — wrap cẩn thận để parse trước khi check quota
  (req, res, next) => {
    const parse = BreakdownReqSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "validation", issues: parse.error.issues });
    }
    req.body = parse.data;
    const cost = parse.data.students.length;
    return requireQuota("perStudentBreakdown", cost)(req, res, next);
  },
  async (req, res, next) => {
    try {
      const body = req.body as z.infer<typeof BreakdownReqSchema>;
      const tier = getCurrentTier(req.mentorId);
      const items = await runPerStudentBreakdown({
        ...body,
        tier,
        mentorId: req.mentorId,
      });
      // Record sau khi action thành công
      recordUsage(req, "perStudentBreakdown", body.students.length);
      res.json({
        items,
        meta: {
          count: items.length,
          tier,
          quota: req.quota,
        },
      });
    } catch (e) {
      next(e);
    }
  },
);

export default router;
