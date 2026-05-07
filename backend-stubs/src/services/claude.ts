import { config } from "../config.js";
import { getModel, estimateCostUSD as registryCost, type TenantTier } from "../config/models.js";
import { getPrompt } from "../prompts/index.js";
import { callAnthropic } from "./anthropic-client.js";
import { logClaudeUsage } from "./usage-log.js";

/**
 * Wrapper cho Anthropic API (Claude). Mọi pricing/model metadata lấy từ
 * `config/models.ts`; system prompt lấy từ `prompts/session-summary.v*`.
 *
 * Default: Haiku (rẻ, đủ chất lượng). Sonnet/Opus theo tenant tier.
 *
 * Prompt caching: nếu prompt template `cacheable=true`, BE đính cache_control
 * ephemeral vào system block → giảm 90% input cost từ lần gọi thứ 2.
 *
 * Mock mode: khi không có ANTHROPIC_API_KEY, trả mock summary có shape giống
 * thật, cost tính theo registry → FE/test e2e không cần creds.
 */

export interface SummarizeRequest {
  transcript: string;
  courseName: string;
  sessionNumber: number;
  sessionTitle: string;
  /** Alias model: "haiku" | "sonnet" | "opus" — resolve qua registry */
  model?: string;
  /** Tenant tier để check access. Mặc định "free". */
  tier?: TenantTier;
  /** Prompt version, default v1 */
  promptVersion?: string;
  /** Optional metadata để log usage gắn đúng session */
  mentorId?: string;
  tenantId?: string;
  sessionId?: string;
}

export interface SummarizeResult {
  summary: string;
  keyPoints: { time: string; text: string }[];
  questions: { time: string; student: string; q: string; a: string }[];
  actionItems: string[];
  tokensIn: number;
  tokensOut: number;
  cacheReadTokens: number;
  costUSD: number;
  model: string;
  promptVersion: string;
}

export async function summarize(req: SummarizeRequest): Promise<SummarizeResult> {
  const modelAlias = req.model ?? "haiku";
  const model = getModel(modelAlias);
  const tier: TenantTier = req.tier ?? "free";
  if (!model.access.includes(tier)) {
    throw new Error(
      `[claude] Model ${model.alias} không khả dụng cho tier ${tier}. Upgrade plan để dùng.`,
    );
  }
  const prompt = getPrompt("session-summary", req.promptVersion ?? "v1");

  if (!config.anthropic.apiKey) {
    return mockSummary(req, model.id, prompt.version);
  }

  const userText = prompt.buildUser!(req as unknown as Record<string, unknown>);
  const apiResult = await callAnthropic({
    modelId: model.id,
    systemText: prompt.system,
    userText,
    cacheable: prompt.cacheable && model.supportsCaching,
    maxTokens: 2000,
    jsonMode: true,
  });

  const parsed = safeParseJSON<SummarizeJSON>(apiResult.text) ?? fallbackParse(apiResult.text);
  const costUSD = registryCost(
    model.id,
    apiResult.tokensIn,
    apiResult.tokensOut,
    apiResult.cacheReadTokens,
    apiResult.cacheWriteTokens,
  );

  if (req.mentorId) {
    logClaudeUsage({
      tenantId: req.tenantId,
      mentorId: req.mentorId,
      sessionId: req.sessionId,
      modelId: model.id,
      promptVersion: prompt.version,
      tokensIn: apiResult.tokensIn,
      tokensOut: apiResult.tokensOut,
      cacheReadTokens: apiResult.cacheReadTokens,
      cacheWriteTokens: apiResult.cacheWriteTokens,
      durationMs: apiResult.durationMs,
      step: "claude",
    });
  }

  return {
    summary: parsed.summary ?? "",
    keyPoints: parsed.keyPoints ?? [],
    questions: parsed.questions ?? [],
    actionItems: parsed.actionItems ?? [],
    tokensIn: apiResult.tokensIn,
    tokensOut: apiResult.tokensOut,
    cacheReadTokens: apiResult.cacheReadTokens,
    costUSD,
    model: model.id,
    promptVersion: prompt.version,
  };
}

interface SummarizeJSON {
  summary?: string;
  keyPoints?: { time: string; text: string }[];
  questions?: { time: string; student: string; q: string; a: string }[];
  actionItems?: string[];
}

function safeParseJSON<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Try extract first {...} block
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]) as T;
    } catch {
      return null;
    }
  }
}

function fallbackParse(text: string): SummarizeJSON {
  // LLM không trả JSON sạch → giữ raw text vào summary, các field khác rỗng
  return { summary: text.trim(), keyPoints: [], questions: [], actionItems: [] };
}

function mockSummary(req: SummarizeRequest, modelId: string, promptVersion: string): SummarizeResult {
  const tokensIn = Math.ceil(req.transcript.length / 4);
  const tokensOut = 800;
  const costUSD = registryCost(modelId, tokensIn, tokensOut);

  return {
    summary: `[MOCK] Buổi ${req.sessionNumber} khoá ${req.courseName} tập trung ${req.sessionTitle}. Học viên tương tác tích cực.`,
    keyPoints: [
      { time: "02:14", text: "Giới thiệu chủ đề chính" },
      { time: "28:30", text: "Demo hands-on" },
      { time: "1:02:08", text: "Case study thực tế" },
    ],
    questions: [
      { time: "0:34:11", student: "Trần Văn Đức", q: "(mock question)", a: "(mock answer)" },
    ],
    actionItems: [
      "Homework: (mock)",
      "Đọc trước: (mock)",
    ],
    tokensIn,
    tokensOut,
    cacheReadTokens: 0,
    costUSD,
    model: modelId,
    promptVersion,
  };
}

/** Backward-compat: legacy callers pass alias. Forwards to registry. */
export function estimateCost(tokensIn: number, tokensOut: number, modelAlias: string): number {
  return registryCost(modelAlias, tokensIn, tokensOut);
}
