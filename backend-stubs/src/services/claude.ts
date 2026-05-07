import { config } from "../config.js";
import { getModel, estimateCostUSD as registryCost, type TenantTier } from "../config/models.js";
import { getPrompt } from "../prompts/index.js";

/**
 * Wrapper cho Anthropic API (Claude). Mọi pricing/model metadata lấy từ
 * `config/models.ts`; system prompt lấy từ `prompts/session-summary.v*`.
 *
 * Default: Haiku (rẻ, đủ chất lượng). Sonnet/Opus theo tenant tier.
 *
 * Prompt caching: nếu prompt template `cacheable=true`, BE đính cache_control
 * ephemeral vào system block → giảm 90% input cost từ lần gọi thứ 2.
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
}

export interface SummarizeResult {
  summary: string;
  keyPoints: { time: string; text: string }[];
  questions: { time: string; student: string; q: string; a: string }[];
  actionItems: string[];
  tokensIn: number;
  tokensOut: number;
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

  // POST https://api.anthropic.com/v1/messages
  // body: {
  //   model: model.id,
  //   max_tokens: 2000,
  //   system: prompt.cacheable
  //     ? [{ type: "text", text: prompt.system, cache_control: { type: "ephemeral" } }]
  //     : prompt.system,
  //   messages: [{ role: "user", content: prompt.buildUser!(req) }],
  // }
  // TODO: real fetch — Phase 5

  return mockSummary(req, model.id, prompt.version);
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
    costUSD,
    model: modelId,
    promptVersion,
  };
}

/** Backward-compat: legacy callers pass alias. Forwards to registry. */
export function estimateCost(tokensIn: number, tokensOut: number, modelAlias: string): number {
  return registryCost(modelAlias, tokensIn, tokensOut);
}
