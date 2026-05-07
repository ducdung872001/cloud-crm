import { Router } from "express";
import { reportCourse, reportStudent } from "../services/journey-report.js";

const router = Router();

function tenantOf(mentorId: string) {
  return `TENANT-${mentorId}`;
}

router.get("/course/:id", (req, res) => {
  const r = reportCourse(req.params.id);
  if (!r) return res.status(404).json({ error: "Course not found" });
  res.json(r);
});

router.get("/student/:id", (req, res) => {
  const r = reportStudent(req.params.id, tenantOf(req.mentorId));
  if (!r) return res.status(404).json({ error: "Student not found in tenant courses" });
  res.json(r);
});

export default router;
