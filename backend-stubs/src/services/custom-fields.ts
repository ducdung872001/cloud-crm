import { v4 as uuid } from "uuid";
import { db } from "../db/store.js";
import type { CustomFieldDefinition, CustomFieldValue } from "../db/types.js";

/**
 * Custom fields per tenant — cho phép mentor thêm field tuỳ ý vào hồ sơ HV / khoá học.
 *
 * Định nghĩa: tenant + scope + key unique. Giá trị: tenant + entityType + entityId + key unique.
 *
 * Validation rule:
 *   - key chỉ chấp nhận snake_case [a-z0-9_]+
 *   - select / multi_select PHẢI có options
 *   - cùng tenant + scope + key → error 409
 */

export interface CreateDefinitionInput {
  tenantId: string;
  scope: "student" | "course";
  name: string;
  key: string;
  type: CustomFieldDefinition["type"];
  required: boolean;
  options?: string[];
  description?: string;
}

const KEY_RE = /^[a-z][a-z0-9_]{0,40}$/;

export function createDefinition(input: CreateDefinitionInput): CustomFieldDefinition {
  if (!KEY_RE.test(input.key)) {
    throw new Error(`[custom-fields] key invalid: ${input.key} (snake_case, ≤ 41 ký tự)`);
  }
  if ((input.type === "select" || input.type === "multi_select") && (!input.options || input.options.length === 0)) {
    throw new Error(`[custom-fields] type ${input.type} cần options`);
  }
  const dup = Array.from(db.customFieldDefs.values())
    .find((d) => d.tenantId === input.tenantId && d.scope === input.scope && d.key === input.key);
  if (dup) {
    const err = new Error(`[custom-fields] key ${input.key} đã tồn tại trong scope ${input.scope}`);
    (err as Error & { code?: number }).code = 409;
    throw err;
  }
  const def: CustomFieldDefinition = {
    id: "CFD-" + uuid().slice(0, 8),
    tenantId: input.tenantId,
    scope: input.scope,
    name: input.name,
    key: input.key,
    type: input.type,
    required: input.required,
    options: input.options,
    description: input.description,
    createdAt: new Date().toISOString(),
  };
  db.customFieldDefs.set(def.id, def);
  return def;
}

export function listDefinitions(tenantId: string, scope?: "student" | "course"): CustomFieldDefinition[] {
  return Array.from(db.customFieldDefs.values())
    .filter((d) => d.tenantId === tenantId && (!scope || d.scope === scope));
}

export function deleteDefinition(id: string): boolean {
  const def = db.customFieldDefs.get(id);
  if (!def) return false;
  db.customFieldDefs.delete(id);
  // Xoá values liên quan để tránh orphan
  db.customFieldValues = db.customFieldValues.filter(
    (v) => !(v.tenantId === def.tenantId && v.entityType === def.scope && v.fieldKey === def.key),
  );
  return true;
}

export interface SetValueInput {
  tenantId: string;
  entityType: "student" | "course";
  entityId: string;
  fieldKey: string;
  value: CustomFieldValue["value"];
}

export function setValue(input: SetValueInput): CustomFieldValue {
  // Validate field tồn tại + type-check
  const def = Array.from(db.customFieldDefs.values())
    .find((d) => d.tenantId === input.tenantId && d.scope === input.entityType && d.key === input.fieldKey);
  if (!def) throw new Error(`[custom-fields] No definition for ${input.entityType}.${input.fieldKey}`);
  validateValue(def, input.value);

  const existing = db.customFieldValues.find(
    (v) => v.tenantId === input.tenantId && v.entityType === input.entityType
        && v.entityId === input.entityId && v.fieldKey === input.fieldKey,
  );
  if (existing) {
    existing.value = input.value;
    existing.updatedAt = new Date().toISOString();
    return existing;
  }
  const v: CustomFieldValue = { ...input, updatedAt: new Date().toISOString() };
  db.customFieldValues.push(v);
  return v;
}

export function getValuesFor(
  tenantId: string,
  entityType: "student" | "course",
  entityId: string,
): Record<string, CustomFieldValue["value"]> {
  const out: Record<string, CustomFieldValue["value"]> = {};
  for (const v of db.customFieldValues) {
    if (v.tenantId === tenantId && v.entityType === entityType && v.entityId === entityId) {
      out[v.fieldKey] = v.value;
    }
  }
  return out;
}

function validateValue(def: CustomFieldDefinition, value: unknown) {
  if (value == null) {
    if (def.required) throw new Error(`[custom-fields] ${def.key} required`);
    return;
  }
  switch (def.type) {
    case "text":
      if (typeof value !== "string") throw new Error(`[custom-fields] ${def.key} must be string`);
      break;
    case "number":
      if (typeof value !== "number") throw new Error(`[custom-fields] ${def.key} must be number`);
      break;
    case "boolean":
      if (typeof value !== "boolean") throw new Error(`[custom-fields] ${def.key} must be boolean`);
      break;
    case "date":
      if (typeof value !== "string" || isNaN(Date.parse(value))) {
        throw new Error(`[custom-fields] ${def.key} must be ISO date`);
      }
      break;
    case "select":
      if (typeof value !== "string" || !def.options?.includes(value)) {
        throw new Error(`[custom-fields] ${def.key} must be one of ${def.options?.join(",")}`);
      }
      break;
    case "multi_select":
      if (!Array.isArray(value) || value.some((v) => !def.options?.includes(v as string))) {
        throw new Error(`[custom-fields] ${def.key} must be array of ${def.options?.join(",")}`);
      }
      break;
  }
}
