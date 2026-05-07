import { v4 as uuid } from "uuid";
import { db } from "../db/store.js";
import { getPrompt, listPrompts, type PromptTemplate } from "../prompts/index.js";
import type { PromptTemplateOverride } from "../db/types.js";

/**
 * Prompt manager — combine default registry + tenant override.
 *
 * Resolve order khi gọi `resolvePrompt(tenantId, name, version?)`:
 *   1. Override active của tenant + name + version → ưu tiên
 *   2. Override active của tenant + name (không match version) → fallback
 *   3. Default registry (prompts/*.ts)
 *
 * Lý do: tenant Master/Academy thường tự fine-tune prompt cho domain (giáo dục
 * phổ thông vs đào tạo doanh nghiệp). Default registry là baseline cho free/trial.
 */

export interface CreateOverrideInput {
  tenantId: string;
  createdBy: string;
  name: string;
  version: string;
  description: string;
  cacheable: boolean;
  system: string;
  userTemplate?: string;
  active?: boolean;
}

export function createOverride(input: CreateOverrideInput): PromptTemplateOverride {
  // Validate name có trong default registry
  try { getPrompt(input.name); }
  catch { throw new Error(`[prompts] Unknown prompt name: ${input.name}`); }

  // Duplicate (tenantId, name, version) → error
  const dup = Array.from(db.promptOverrides.values())
    .find((o) => o.tenantId === input.tenantId && o.name === input.name && o.version === input.version);
  if (dup) {
    const err = new Error(`[prompts] Override ${input.name}@${input.version} đã tồn tại cho tenant ${input.tenantId}`);
    (err as Error & { code?: number }).code = 409;
    throw err;
  }

  const ov: PromptTemplateOverride = {
    id: "PRO-" + uuid().slice(0, 8),
    tenantId: input.tenantId,
    createdBy: input.createdBy,
    name: input.name,
    version: input.version,
    description: input.description,
    cacheable: input.cacheable,
    system: input.system,
    userTemplate: input.userTemplate,
    active: input.active ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Nếu set active → deactivate các override khác cùng (tenantId, name)
  if (ov.active) deactivateOthers(input.tenantId, input.name, ov.id);

  db.promptOverrides.set(ov.id, ov);
  return ov;
}

export function updateOverride(
  id: string,
  patch: Partial<Pick<PromptTemplateOverride, "description" | "cacheable" | "system" | "userTemplate" | "active">>,
): PromptTemplateOverride {
  const ov = db.promptOverrides.get(id);
  if (!ov) throw new Error(`[prompts] Override ${id} not found`);
  if (patch.description !== undefined) ov.description = patch.description;
  if (patch.cacheable !== undefined) ov.cacheable = patch.cacheable;
  if (patch.system !== undefined) ov.system = patch.system;
  if (patch.userTemplate !== undefined) ov.userTemplate = patch.userTemplate;
  if (patch.active !== undefined) {
    ov.active = patch.active;
    if (patch.active) deactivateOthers(ov.tenantId, ov.name, ov.id);
  }
  ov.updatedAt = new Date().toISOString();
  return ov;
}

export function deleteOverride(id: string): boolean {
  return db.promptOverrides.delete(id);
}

export function listOverrides(tenantId: string, name?: string): PromptTemplateOverride[] {
  return Array.from(db.promptOverrides.values())
    .filter((o) => o.tenantId === tenantId && (!name || o.name === name))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * Resolve prompt cho 1 tenant: ưu tiên override active.
 * Nếu không có → trả default từ registry.
 */
export function resolvePrompt(tenantId: string, name: string, version?: string): PromptTemplate {
  const overrides = listOverrides(tenantId, name);
  // 1. Match version cụ thể nếu yêu cầu
  if (version) {
    const exact = overrides.find((o) => o.version === version && o.active);
    if (exact) return overrideToTemplate(exact);
  }
  // 2. Active override bất kỳ
  const active = overrides.find((o) => o.active);
  if (active) return overrideToTemplate(active);
  // 3. Default
  return getPrompt(name, version);
}

function overrideToTemplate(o: PromptTemplateOverride): PromptTemplate {
  return {
    name: o.name,
    version: o.version,
    description: o.description,
    cacheable: o.cacheable,
    system: o.system,
    buildUser: o.userTemplate ? buildUserFromTemplate(o.userTemplate) : undefined,
  };
}

/** {{varName}} placeholder — replace từ vars object. Missing key → giữ placeholder. */
function buildUserFromTemplate(template: string) {
  return (vars: Record<string, unknown>) =>
    template.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{{${k}}}`));
}

function deactivateOthers(tenantId: string, name: string, exceptId: string) {
  for (const o of db.promptOverrides.values()) {
    if (o.tenantId === tenantId && o.name === name && o.id !== exceptId && o.active) {
      o.active = false;
      o.updatedAt = new Date().toISOString();
    }
  }
}

/**
 * List default prompts từ registry — cho UI manager hiển thị baseline.
 */
export function listDefaults() {
  return listPrompts().map(({ name, versions }) => ({
    name,
    versions: versions.map((v) => {
      const tmpl = getPrompt(name, v);
      return { version: v, description: tmpl.description, cacheable: tmpl.cacheable };
    }),
  }));
}
