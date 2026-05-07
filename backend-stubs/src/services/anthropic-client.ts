/**
 * Low-level Anthropic Messages API client.
 *
 * Tách khỏi `claude.ts` để tái sử dụng cho per-student-breakdown, zalo-outbound
 * mà không phải dup logic prompt-cache + retry + parse.
 *
 * Hỗ trợ:
 * - Prompt caching (cache_control: ephemeral) — chỉ apply cho system block
 * - Streaming optional (D2: từ Starter trở lên) — skipped trong stub, để TODO
 * - Retry 1 lần khi 5xx hoặc rate-limit (429 với Retry-After)
 */

import { config } from "../config.js";

export interface AnthropicCallInput {
  modelId: string;
  systemText: string;
  userText: string;
  cacheable: boolean;
  maxTokens?: number;
  /** ResponseFormat = JSON: hint LLM trả JSON thuần */
  jsonMode?: boolean;
}

export interface AnthropicCallResult {
  text: string;
  /** Token usage trả từ API */
  tokensIn: number;
  tokensOut: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  durationMs: number;
}

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const PROMPT_CACHE_BETA = "prompt-caching-2024-07-31";

export async function callAnthropic(input: AnthropicCallInput): Promise<AnthropicCallResult> {
  const start = Date.now();

  const systemBlock = input.cacheable
    ? [{ type: "text", text: input.systemText, cache_control: { type: "ephemeral" } }]
    : input.systemText;

  const body: Record<string, unknown> = {
    model: input.modelId,
    max_tokens: input.maxTokens ?? 2000,
    system: systemBlock,
    messages: [{ role: "user", content: input.userText }],
  };
  if (input.jsonMode) {
    // Anthropic không có hard JSON mode — assistant prefix kĩ thuật để guide
    body.messages = [
      { role: "user", content: input.userText },
      { role: "assistant", content: "{" },
    ];
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-api-key": config.anthropic.apiKey,
    "anthropic-version": ANTHROPIC_VERSION,
  };
  if (input.cacheable) {
    headers["anthropic-beta"] = PROMPT_CACHE_BETA;
  }

  const res = await fetchWithRetry(ANTHROPIC_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[anthropic] ${res.status} ${res.statusText}: ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text?: string }>;
    usage: {
      input_tokens: number;
      output_tokens: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
    };
  };

  const textContent = (data.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("");

  return {
    text: input.jsonMode ? "{" + textContent : textContent,
    tokensIn: data.usage.input_tokens,
    tokensOut: data.usage.output_tokens,
    cacheReadTokens: data.usage.cache_read_input_tokens ?? 0,
    cacheWriteTokens: data.usage.cache_creation_input_tokens ?? 0,
    durationMs: Date.now() - start,
  };
}

async function fetchWithRetry(url: string, init: RequestInit, attempt = 0): Promise<Response> {
  const res = await fetch(url, init);
  if (res.ok || attempt >= 1) return res;
  if (res.status >= 500 || res.status === 429) {
    const wait = res.status === 429 ? Number(res.headers.get("retry-after") ?? 2) * 1000 : 1000;
    await new Promise((r) => setTimeout(r, wait));
    return fetchWithRetry(url, init, attempt + 1);
  }
  return res;
}
