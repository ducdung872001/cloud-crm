import { Router } from "express";
import { z } from "zod";
import { progressFor, markStep } from "../services/onboarding.js";

const router = Router();

// GET /onboarding/state — progress của mentor hiện tại
router.get("/state", (req, res) => {
  res.json(progressFor(req.mentorId));
});

// PATCH /onboarding/state/:step — manual mark step done/undone
const stepKeys = [
  "zoom_connected",
  "zalo_connected",
  "first_course_created",
  "first_student_invited",
  "first_session_scheduled",
] as const;
const patchSchema = z.object({ done: z.boolean() });

router.patch("/state/:step", (req, res) => {
  const step = req.params.step as typeof stepKeys[number];
  if (!stepKeys.includes(step)) return res.status(400).json({ error: "Unknown step", validSteps: stepKeys });
  const body = patchSchema.parse(req.body);
  markStep(req.mentorId, step, body.done);
  res.json(progressFor(req.mentorId));
});

export default router;
