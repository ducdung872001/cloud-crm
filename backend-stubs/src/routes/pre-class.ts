import { Router } from "express";
import { z } from "zod";
import { db } from "../db/store.js";
import {
  ensureChecklist, manualToggle, getChecklist, listChecklistsForMentor,
} from "../services/pre-class-checklist.js";
import { buildDigest } from "../services/pre-class-digest.js";

const router = Router();

// GET /pre-class/digest — pre-class digest cho mentor
router.get("/digest", (req, res) => {
  const digest = buildDigest(req.mentorId);
  res.json(digest);
});

// GET /pre-class/checklist/:sessionId — get hoặc auto-create
router.get("/checklist/:sessionId", (req, res) => {
  const session = db.sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  const checklist = ensureChecklist(req.params.sessionId);
  res.json(checklist);
});

// GET /pre-class/checklists — list all checklists for current mentor
router.get("/checklists", (req, res) => {
  res.json(listChecklistsForMentor(req.mentorId));
});

// PATCH /pre-class/checklist/:sessionId/:itemKey — manual toggle
const toggleSchema = z.object({ done: z.boolean() });
router.patch("/checklist/:sessionId/:itemKey", (req, res) => {
  const body = toggleSchema.parse(req.body);
  const checklist = manualToggle(req.params.sessionId, req.params.itemKey as never, body.done);
  res.json(checklist);
});

// GET /pre-class/checklist/:sessionId — alias return raw (without auto-create)
router.get("/checklist-raw/:sessionId", (req, res) => {
  const checklist = getChecklist(req.params.sessionId);
  if (!checklist) return res.status(404).json({ error: "No checklist yet" });
  res.json(checklist);
});

export default router;
