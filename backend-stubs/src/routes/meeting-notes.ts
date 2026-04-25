import { Router } from "express";
import { z } from "zod";
import { db } from "../db/store.js";
import { queueTranscribeJob } from "../jobs/transcribe.js";

const router = Router();

// GET /meeting-notes
router.get("/", (req, res) => {
  const { courseId } = req.query;
  const notes = Array.from(db.meetingNotes.values())
    .filter((n) => n.mentorId === req.mentorId)
    .filter((n) => !courseId || n.courseId === courseId)
    .sort((a, b) => b.date.localeCompare(a.date));
  res.json(notes);
});

// GET /meeting-notes/:id
router.get("/:id", (req, res) => {
  const note = db.meetingNotes.get(req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });
  if (note.mentorId !== req.mentorId) return res.status(403).json({ error: "Forbidden" });
  res.json(note);
});

// POST /meeting-notes/:id/generate — manual trigger pipeline
router.post("/:id/generate", (req, res) => {
  const note = db.meetingNotes.get(req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });
  if (note.status === "ready") return res.json({ status: "already_ready", id: note.id });

  note.status = "processing";
  queueTranscribeJob({
    mentorId: note.mentorId,
    zoomMeetingId: note.zoomMeetingId ?? note.id,
    downloadUrl: note.recordingUrl ?? "",
    downloadToken: "mock",
    recordingStart: note.date,
  });

  res.status(202).json({
    jobId: "JOB-" + Date.now(),
    estimatedReadyAt: new Date(Date.now() + 8 * 60_000).toISOString(),
  });
});

// POST /meeting-notes/:id/send — gửi note tới HV
const sendSchema = z.object({
  studentIds: z.array(z.string()).min(1),
  channels: z.array(z.enum(["email", "zalo", "inapp"])).min(1),
  subject: z.string().min(3),
  includeRecording: z.boolean().optional().default(true),
  includeActionItems: z.boolean().optional().default(true),
});
router.post("/:id/send", (req, res) => {
  const body = sendSchema.parse(req.body);
  const note = db.meetingNotes.get(req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });

  // TODO: queue job gửi email + zalo push
  // fakeSendBulk(body.studentIds, body.channels, note);

  res.json({ sent: body.studentIds.length, skipped: 0 });
});

// POST /meeting-notes/:id/share-link — tạo link public
router.post("/:id/share-link", (req, res) => {
  const { expiresIn } = z.object({ expiresIn: z.enum(["7d", "30d", "forever"]) }).parse(req.body);
  const note = db.meetingNotes.get(req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });

  const token = Math.random().toString(36).slice(2, 12);
  const url = `http://localhost:4000/crm/shared/meeting-note/${token}`;
  const expiresAt = expiresIn === "forever" ? null : new Date(Date.now() + (expiresIn === "7d" ? 7 : 30) * 86400_000).toISOString();

  res.json({ url, expiresAt });
});

export default router;
