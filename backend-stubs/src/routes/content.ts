import { Router } from "express";
import { z } from "zod";
import {
  createMaterial, addVersion, listMaterials, getMaterialChain,
  generateDownloadUrl, setPolicy, listPolicies, canAccess,
} from "../services/materials.js";
import { listEntries, createEntry, deleteEntry, validateUrl, extractOEmbed } from "../services/embed-whitelist.js";

const router = Router();

function tenantOf(mentorId: string) {
  return `TENANT-${mentorId}`;
}

// ── Materials ───────────────────────────────────────────────────────────

const createMatSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  kind: z.enum(["pdf", "video", "audio", "doc", "slide", "image", "archive"]),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive(),
  courseId: z.string().optional(),
});
router.post("/materials", (req, res) => {
  const body = createMatSchema.parse(req.body);
  res.status(201).json(createMaterial({
    tenantId: tenantOf(req.mentorId),
    uploaderMentorId: req.mentorId,
    ...body,
  }));
});

const addVerSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive(),
});
router.post("/materials/:id/versions", (req, res) => {
  const body = addVerSchema.parse(req.body);
  try {
    res.status(201).json(addVersion({ parentMaterialId: req.params.id, uploaderMentorId: req.mentorId, ...body }));
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

router.get("/materials", (req, res) => {
  const courseId = req.query.courseId as string | undefined;
  res.json(listMaterials(tenantOf(req.mentorId), courseId));
});

router.get("/materials/:id/chain", (req, res) => {
  const chain = getMaterialChain(req.params.id);
  if (chain.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(chain);
});

router.get("/materials/:id/download", (req, res) => {
  const url = generateDownloadUrl(req.params.id);
  if (!url) return res.status(404).json({ error: "Not found" });
  res.json({ url, ttlSec: 600 });
});

const policySchema = z.object({
  audienceType: z.enum(["course", "student", "tier"]),
  audienceId: z.string(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  mode: z.enum(["view", "download"]).default("view"),
});
router.put("/materials/:id/policies", (req, res) => {
  const body = policySchema.parse(req.body);
  res.json(setPolicy({ tenantId: tenantOf(req.mentorId), materialId: req.params.id, ...body }));
});

router.get("/materials/:id/policies", (req, res) => {
  res.json(listPolicies(tenantOf(req.mentorId), req.params.id));
});

const accessCheckSchema = z.object({
  courseIds: z.array(z.string()).optional(),
  studentId: z.string().optional(),
  tier: z.string().optional(),
});
router.post("/materials/:id/check-access", (req, res) => {
  const body = accessCheckSchema.parse(req.body);
  res.json(canAccess({ tenantId: tenantOf(req.mentorId), materialId: req.params.id, ...body }));
});

// ── Embed whitelist ─────────────────────────────────────────────────────

router.get("/embed/whitelist", (req, res) => {
  res.json(listEntries(tenantOf(req.mentorId)));
});

const entrySchema = z.object({
  domainPattern: z.string().min(1),
  provider: z.enum(["notion", "drive", "loom", "youtube", "vimeo", "miro", "figma", "other"]),
  allowIframe: z.boolean().default(true),
  enabled: z.boolean().default(true),
});
router.post("/embed/whitelist", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Admin only" });
  const body = entrySchema.parse(req.body);
  res.status(201).json(createEntry({ tenantId: tenantOf(req.mentorId), ...body }));
});

router.delete("/embed/whitelist/:id", (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Admin only" });
  try {
    res.status(deleteEntry(req.params.id) ? 204 : 404).end();
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.post("/embed/validate", (req, res) => {
  const url = (req.body?.url as string) ?? "";
  if (!url) return res.status(400).json({ error: "url required" });
  const r = validateUrl(url, tenantOf(req.mentorId));
  res.json({ ...r, oembed: r.allowed ? extractOEmbed(url, tenantOf(req.mentorId)) : null });
});

export default router;
