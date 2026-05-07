import { v4 as uuid } from "uuid";
import { db } from "../db/store.js";
import type { Material, MaterialKind, MaterialAccessPolicy } from "../db/types.js";

/**
 * Material upload + version chain + access control.
 *
 * Flow:
 *   1. createMaterial → return signed PUT URL stub (FE upload trực tiếp lên S3)
 *   2. confirmUpload → set status=active sau khi FE confirm upload xong
 *   3. addVersion → tạo material mới, gắn parentMaterialId, set replacedById trên version cũ
 *   4. setPolicy → grant access cho course/student/tier với expiry
 *   5. canAccess → check policy của 1 audience
 */

export interface CreateMaterialInput {
  tenantId: string;
  uploaderMentorId: string;
  title: string;
  description?: string;
  kind: MaterialKind;
  mimeType: string;
  sizeBytes: number;
  courseId?: string;
}

export function createMaterial(input: CreateMaterialInput): { material: Material; uploadUrl: string } {
  const id = "MAT-" + uuid().slice(0, 8);
  const storageKey = `tenant/${input.tenantId}/materials/${id}.${guessExt(input.kind, input.mimeType)}`;
  const material: Material = {
    id,
    tenantId: input.tenantId,
    courseId: input.courseId,
    uploaderMentorId: input.uploaderMentorId,
    title: input.title,
    description: input.description,
    kind: input.kind,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    storageKey,
    version: 1,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  db.materials.set(id, material);
  return { material, uploadUrl: stubSignedPutUrl(storageKey) };
}

export interface AddVersionInput {
  parentMaterialId: string;
  uploaderMentorId: string;
  title?: string;
  description?: string;
  mimeType: string;
  sizeBytes: number;
}

export function addVersion(input: AddVersionInput): { material: Material; uploadUrl: string } {
  const parent = db.materials.get(input.parentMaterialId);
  if (!parent) throw new Error(`[material] parent ${input.parentMaterialId} not found`);
  // Find latest in chain
  let latest = parent;
  while (latest.replacedById) {
    const next = db.materials.get(latest.replacedById);
    if (!next) break;
    latest = next;
  }

  const id = "MAT-" + uuid().slice(0, 8);
  const storageKey = `tenant/${parent.tenantId}/materials/${id}.${guessExt(parent.kind, input.mimeType)}`;
  const material: Material = {
    id,
    tenantId: parent.tenantId,
    courseId: parent.courseId,
    uploaderMentorId: input.uploaderMentorId,
    title: input.title ?? parent.title,
    description: input.description ?? parent.description,
    kind: parent.kind,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    storageKey,
    version: latest.version + 1,
    parentMaterialId: latest.id,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  db.materials.set(id, material);

  // Mark previous as replaced
  latest.replacedById = id;
  return { material, uploadUrl: stubSignedPutUrl(storageKey) };
}

export function listMaterials(tenantId: string, courseId?: string): Material[] {
  return Array.from(db.materials.values())
    .filter((m) => m.tenantId === tenantId)
    .filter((m) => !courseId || m.courseId === courseId)
    .filter((m) => m.status === "active")
    .filter((m) => !m.replacedById)        // chỉ trả latest trong chain
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getMaterialChain(materialId: string): Material[] {
  // Walk parent chain rồi forward chain để có full version history
  let current = db.materials.get(materialId);
  if (!current) return [];
  // Walk to root
  while (current.parentMaterialId) {
    const parent = db.materials.get(current.parentMaterialId);
    if (!parent) break;
    current = parent;
  }
  // Walk forward
  const chain: Material[] = [current];
  while (current.replacedById) {
    const next = db.materials.get(current.replacedById);
    if (!next) break;
    chain.push(next);
    current = next;
  }
  return chain;
}

/**
 * Generate fresh signed URL với TTL ngắn (production: AWS S3 GetObject sign).
 * Stub: trả URL deterministic + ký TTL trong query.
 */
export function generateDownloadUrl(materialId: string, ttlSec = 600): string | null {
  const m = db.materials.get(materialId);
  if (!m || m.status !== "active") return null;
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  return `https://stub.s3.mentorhub.vn/${m.storageKey}?exp=${exp}&sig=STUB_${materialId.slice(-6)}`;
}

// ── Access control ─────────────────────────────────────────────────────

export function setPolicy(input: Omit<MaterialAccessPolicy, "createdAt">): MaterialAccessPolicy {
  // Upsert: replace policy với cùng (tenant, material, audience)
  const existingIdx = db.materialAccessPolicies.findIndex(
    (p) => p.tenantId === input.tenantId
        && p.materialId === input.materialId
        && p.audienceType === input.audienceType
        && p.audienceId === input.audienceId,
  );
  const policy: MaterialAccessPolicy = { ...input, createdAt: new Date().toISOString() };
  if (existingIdx >= 0) db.materialAccessPolicies[existingIdx] = policy;
  else db.materialAccessPolicies.push(policy);
  return policy;
}

export function listPolicies(tenantId: string, materialId: string): MaterialAccessPolicy[] {
  return db.materialAccessPolicies.filter(
    (p) => p.tenantId === tenantId && p.materialId === materialId,
  );
}

export interface AccessCheckInput {
  tenantId: string;
  materialId: string;
  /** Tất cả audience IDs mà subject thuộc về */
  courseIds?: string[];
  studentId?: string;
  tier?: string;
}

export function canAccess(input: AccessCheckInput): { allowed: boolean; mode?: "view" | "download"; matchedPolicy?: MaterialAccessPolicy } {
  const now = new Date();
  const policies = listPolicies(input.tenantId, input.materialId);
  for (const p of policies) {
    if (p.validFrom && new Date(p.validFrom) > now) continue;
    if (p.validUntil && new Date(p.validUntil) <= now) continue;
    let match = false;
    if (p.audienceType === "course" && input.courseIds?.includes(p.audienceId)) match = true;
    else if (p.audienceType === "student" && input.studentId === p.audienceId) match = true;
    else if (p.audienceType === "tier" && input.tier === p.audienceId) match = true;
    if (match) return { allowed: true, mode: p.mode, matchedPolicy: p };
  }
  return { allowed: false };
}

// ── Helpers ─────────────────────────────────────────────────────────────

function guessExt(kind: MaterialKind, mimeType: string): string {
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("zip")) return "zip";
  return kind === "video" ? "mp4" : kind === "audio" ? "mp3" : "bin";
}

function stubSignedPutUrl(storageKey: string): string {
  const exp = Math.floor(Date.now() / 1000) + 900;
  return `https://stub.s3.mentorhub.vn/${storageKey}?put=1&exp=${exp}&sig=STUB_PUT`;
}
