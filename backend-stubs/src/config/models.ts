/**
 * Model registry — single source of truth cho mọi AI model MentorHub gọi.
 *
 * Mỗi entry chứa:
 * - cost: USD per 1M tokens (in / out / cache_read / cache_write nếu có)
 * - context: context window tối đa
 * - tier: capability tier (light / balanced / heavy / vision / fast-stt / quality-stt)
 * - access: tenant tier nào được phép gọi (theo D2 quota matrix)
 *
 * Khi đổi giá hay thêm model mới CHỈ cần sửa file này.
 */

export type CapabilityTier =
  | "light"        // haiku, gpt-4o-mini, groq-llama-instant
  | "balanced"     // sonnet, gpt-4o
  | "heavy"        // opus, gpt-4-turbo
  | "vision"
  | "fast-stt"     // groq whisper turbo
  | "quality-stt"; // openai whisper

export type TenantTier = "trial" | "free" | "starter" | "pro" | "master" | "academy";

export interface ModelEntry {
  id: string;                    // canonical id sent to provider
  alias: string;                 // short id used in BE code (haiku, sonnet, opus, ...)
  provider: "anthropic" | "openai" | "groq" | "gemini";
  capability: CapabilityTier;
  contextWindow: number;
  costPer1MIn: number;
  costPer1MOut: number;
  costPer1MCacheRead?: number;
  costPer1MCacheWrite?: number;
  supportsCaching: boolean;
  supportsVision: boolean;
  supportsStreaming: boolean;
  /** Tenant tiers được phép gọi model này (theo D2). */
  access: TenantTier[];
}

const ALL_TIERS: TenantTier[] = ["trial", "free", "starter", "pro", "master", "academy"];
const FROM_STARTER: TenantTier[] = ["starter", "pro", "master", "academy"];
const FROM_PRO: TenantTier[] = ["pro", "master", "academy"];
const FROM_MASTER: TenantTier[] = ["master", "academy"];

export const MODEL_REGISTRY: Record<string, ModelEntry> = {
  // ---------- Anthropic ----------
  "claude-haiku-4-5": {
    id: "claude-haiku-4-5",
    alias: "haiku",
    provider: "anthropic",
    capability: "light",
    contextWindow: 200_000,
    costPer1MIn: 1,
    costPer1MOut: 5,
    costPer1MCacheRead: 0.1,
    costPer1MCacheWrite: 1.25,
    supportsCaching: true,
    supportsVision: true,
    supportsStreaming: true,
    access: ALL_TIERS,
  },
  "claude-sonnet-4-6": {
    id: "claude-sonnet-4-6",
    alias: "sonnet",
    provider: "anthropic",
    capability: "balanced",
    contextWindow: 200_000,
    costPer1MIn: 3,
    costPer1MOut: 15,
    costPer1MCacheRead: 0.3,
    costPer1MCacheWrite: 3.75,
    supportsCaching: true,
    supportsVision: true,
    supportsStreaming: true,
    access: FROM_STARTER,
  },
  "claude-opus-4-7": {
    id: "claude-opus-4-7",
    alias: "opus",
    provider: "anthropic",
    capability: "heavy",
    contextWindow: 200_000,
    costPer1MIn: 15,
    costPer1MOut: 75,
    costPer1MCacheRead: 1.5,
    costPer1MCacheWrite: 18.75,
    supportsCaching: true,
    supportsVision: true,
    supportsStreaming: true,
    access: FROM_MASTER,
  },

  // ---------- OpenAI ----------
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    alias: "gpt-mini",
    provider: "openai",
    capability: "light",
    contextWindow: 128_000,
    costPer1MIn: 0.15,
    costPer1MOut: 0.6,
    supportsCaching: false,
    supportsVision: true,
    supportsStreaming: true,
    access: ALL_TIERS,
  },
  "gpt-4o": {
    id: "gpt-4o",
    alias: "gpt",
    provider: "openai",
    capability: "balanced",
    contextWindow: 128_000,
    costPer1MIn: 2.5,
    costPer1MOut: 10,
    supportsCaching: false,
    supportsVision: true,
    supportsStreaming: true,
    access: FROM_PRO,
  },
  "whisper-1": {
    id: "whisper-1",
    alias: "whisper-openai",
    provider: "openai",
    capability: "quality-stt",
    contextWindow: 0,
    costPer1MIn: 0,
    costPer1MOut: 0,
    supportsCaching: false,
    supportsVision: false,
    supportsStreaming: false,
    access: ALL_TIERS,
  },

  // ---------- Groq ----------
  "llama-3.3-70b-versatile": {
    id: "llama-3.3-70b-versatile",
    alias: "groq-llama",
    provider: "groq",
    capability: "balanced",
    contextWindow: 128_000,
    costPer1MIn: 0.59,
    costPer1MOut: 0.79,
    supportsCaching: false,
    supportsVision: false,
    supportsStreaming: true,
    access: ALL_TIERS,
  },
  "whisper-large-v3-turbo": {
    id: "whisper-large-v3-turbo",
    alias: "whisper-groq",
    provider: "groq",
    capability: "fast-stt",
    contextWindow: 0,
    costPer1MIn: 0,
    costPer1MOut: 0,
    supportsCaching: false,
    supportsVision: false,
    supportsStreaming: false,
    access: ALL_TIERS,
  },

  // ---------- Gemini ----------
  "gemini-2.0-flash": {
    id: "gemini-2.0-flash",
    alias: "gemini-flash",
    provider: "gemini",
    capability: "light",
    contextWindow: 1_000_000,
    costPer1MIn: 0.1,
    costPer1MOut: 0.4,
    supportsCaching: true,
    supportsVision: true,
    supportsStreaming: true,
    access: ALL_TIERS,
  },
};

const ALIAS_INDEX: Record<string, ModelEntry> = Object.fromEntries(
  Object.values(MODEL_REGISTRY).map((m) => [m.alias, m]),
);

/**
 * Resolve theo id chuẩn (claude-haiku-4-5) hoặc alias (haiku).
 * Throw nếu không tìm thấy — fail fast tốt hơn fallback im lặng.
 */
export function getModel(idOrAlias: string): ModelEntry {
  const m = MODEL_REGISTRY[idOrAlias] ?? ALIAS_INDEX[idOrAlias];
  if (!m) throw new Error(`[models] Unknown model: ${idOrAlias}`);
  return m;
}

export function isAllowedForTier(modelIdOrAlias: string, tier: TenantTier): boolean {
  return getModel(modelIdOrAlias).access.includes(tier);
}

export function estimateCostUSD(
  modelIdOrAlias: string,
  tokensIn: number,
  tokensOut: number,
  cacheReadTokens = 0,
  cacheWriteTokens = 0,
): number {
  const m = getModel(modelIdOrAlias);
  const inCost = (tokensIn / 1_000_000) * m.costPer1MIn;
  const outCost = (tokensOut / 1_000_000) * m.costPer1MOut;
  const crCost = m.costPer1MCacheRead ? (cacheReadTokens / 1_000_000) * m.costPer1MCacheRead : 0;
  const cwCost = m.costPer1MCacheWrite ? (cacheWriteTokens / 1_000_000) * m.costPer1MCacheWrite : 0;
  return inCost + outCost + crCost + cwCost;
}

/** Pick model phù hợp cho task + tier. Fallback theo capability tier. */
export function pickModel(
  capability: CapabilityTier,
  tier: TenantTier,
  preferredProvider?: ModelEntry["provider"],
): ModelEntry {
  const candidates = Object.values(MODEL_REGISTRY).filter(
    (m) => m.capability === capability && m.access.includes(tier),
  );
  if (candidates.length === 0) {
    throw new Error(`[models] No model available for capability=${capability} tier=${tier}`);
  }
  if (preferredProvider) {
    const match = candidates.find((m) => m.provider === preferredProvider);
    if (match) return match;
  }
  return candidates[0]!;
}
