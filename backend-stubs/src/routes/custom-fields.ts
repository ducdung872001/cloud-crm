import { Router } from "express";
import { z } from "zod";
import {
  createDefinition, listDefinitions, deleteDefinition,
  setValue, getValuesFor,
} from "../services/custom-fields.js";

const router = Router();

function tenantOf(mentorId: string) {
  return `TENANT-${mentorId}`;
}

// GET /custom-fields/definitions?scope=student
router.get("/definitions", (req, res) => {
  const scope = req.query.scope as "student" | "course" | undefined;
  res.json(listDefinitions(tenantOf(req.mentorId), scope));
});

// POST /custom-fields/definitions
const createSchema = z.object({
  scope: z.enum(["student", "course"]),
  name: z.string().min(1),
  key: z.string().min(1),
  type: z.enum(["text", "number", "date", "select", "multi_select", "boolean"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  description: z.string().optional(),
});
router.post("/definitions", (req, res) => {
  const body = createSchema.parse(req.body);
  try {
    const def = createDefinition({ tenantId: tenantOf(req.mentorId), ...body });
    res.status(201).json(def);
  } catch (e) {
    const err = e as Error & { code?: number };
    res.status(err.code ?? 400).json({ error: err.message });
  }
});

// DELETE /custom-fields/definitions/:id
router.delete("/definitions/:id", (req, res) => {
  const ok = deleteDefinition(req.params.id);
  res.status(ok ? 204 : 404).end();
});

// GET /custom-fields/values/:entityType/:entityId
router.get("/values/:entityType/:entityId", (req, res) => {
  const entityType = req.params.entityType as "student" | "course";
  if (entityType !== "student" && entityType !== "course") {
    return res.status(400).json({ error: "entityType must be student|course" });
  }
  res.json(getValuesFor(tenantOf(req.mentorId), entityType, req.params.entityId));
});

// PUT /custom-fields/values/:entityType/:entityId/:fieldKey
const setValueSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]),
});
router.put("/values/:entityType/:entityId/:fieldKey", (req, res) => {
  const entityType = req.params.entityType as "student" | "course";
  if (entityType !== "student" && entityType !== "course") {
    return res.status(400).json({ error: "entityType must be student|course" });
  }
  const body = setValueSchema.parse(req.body);
  try {
    const v = setValue({
      tenantId: tenantOf(req.mentorId),
      entityType,
      entityId: req.params.entityId,
      fieldKey: req.params.fieldKey,
      value: body.value,
    });
    res.json(v);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
