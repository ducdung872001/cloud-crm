import { Router } from "express";
import { z } from "zod";
import {
  createOverride, updateOverride, deleteOverride, listOverrides, listDefaults,
} from "../services/prompt-manager.js";

const router = Router();

function tenantOf(mentorId: string) {
  return `TENANT-${mentorId}`;
}

// GET /admin/prompts/defaults — read-only baseline
router.get("/defaults", (_req, res) => {
  res.json(listDefaults());
});

// GET /admin/prompts/overrides?name=session-summary
router.get("/overrides", (req, res) => {
  const name = req.query.name as string | undefined;
  res.json(listOverrides(tenantOf(req.mentorId), name));
});

// POST /admin/prompts/overrides
const createSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1).max(20),
  description: z.string().min(1),
  cacheable: z.boolean(),
  system: z.string().min(10),
  userTemplate: z.string().optional(),
  active: z.boolean().optional(),
});
router.post("/overrides", (req, res) => {
  const body = createSchema.parse(req.body);
  try {
    const ov = createOverride({
      tenantId: tenantOf(req.mentorId),
      createdBy: req.mentorId,
      ...body,
    });
    res.status(201).json(ov);
  } catch (e) {
    const err = e as Error & { code?: number };
    res.status(err.code ?? 400).json({ error: err.message });
  }
});

// PATCH /admin/prompts/overrides/:id
const patchSchema = z.object({
  description: z.string().optional(),
  cacheable: z.boolean().optional(),
  system: z.string().min(10).optional(),
  userTemplate: z.string().optional(),
  active: z.boolean().optional(),
});
router.patch("/overrides/:id", (req, res) => {
  const body = patchSchema.parse(req.body);
  try {
    res.json(updateOverride(req.params.id, body));
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

// DELETE /admin/prompts/overrides/:id
router.delete("/overrides/:id", (req, res) => {
  res.status(deleteOverride(req.params.id) ? 204 : 404).end();
});

export default router;
