import { callAnthropic, type AnthropicCallInput, type AnthropicCallResult } from "./anthropic-client.js";
import { invokeMcp, isMcpAvailable } from "./mcp-client.js";
import { getPlan } from "../config/plans.js";
import type { TenantTier } from "./../config/models.js";

/**
 * AI gateway — chọn route giữa MCP host (Claude Code CLI) và Anthropic API.
 *
 * Decision matrix:
 *   - profile=heavy + MCP available + tier có mcpAccess (Master/Academy) → MCP
 *   - profile=heavy + MCP unavailable → Anthropic API (fallback)
 *   - profile=fast → Anthropic API trực tiếp (streaming, latency-sensitive)
 *   - enableToolUse=true → BẮT BUỘC MCP; nếu không available → throw
 *
 * Lý do: MCP cho heavy task (transcript dài, tool-use file/bash) tận dụng
 * session caching tốt hơn. API cho UX streaming (per-student breakdown từng item).
 */

export type CallProfile = "heavy" | "fast";

export interface GatewayCallInput extends AnthropicCallInput {
  profile?: CallProfile;
  /** Tenant tier để check mcpAccess */
  tier?: TenantTier;
  /** Cần tool-use (file read, bash) — chỉ MCP support */
  enableToolUse?: boolean;
}

export interface GatewayCallResult extends AnthropicCallResult {
  /** Route thực tế đã chọn */
  route: "mcp" | "anthropic-api";
  toolCalls?: { tool: string; durationMs: number }[];
}

export async function callAi(input: GatewayCallInput): Promise<GatewayCallResult> {
  const profile = input.profile ?? "fast";
  const tier = input.tier ?? "free";
  const wantsMcp = shouldRouteToMcp(profile, tier, input.enableToolUse ?? false);

  if (wantsMcp && isMcpAvailable()) {
    try {
      const r = await invokeMcp({
        modelId: input.modelId,
        systemText: input.systemText,
        userText: input.userText,
        maxTokens: input.maxTokens,
        enableToolUse: input.enableToolUse,
      });
      return { ...r, route: "mcp" };
    } catch (e) {
      // Tool-use BẮT BUỘC MCP → không fallback API
      if (input.enableToolUse) throw e;
      console.warn(`[ai-gateway] MCP failed, fallback API: ${(e as Error).message}`);
      // Fall through to API
    }
  }

  // Heavy + tier không có mcpAccess + tool-use → reject sớm
  if (input.enableToolUse) {
    throw new Error("[ai-gateway] tool-use yêu cầu MCP, nhưng MCP không khả dụng");
  }

  const apiResult = await callAnthropic(input);
  return { ...apiResult, route: "anthropic-api" };
}

function shouldRouteToMcp(profile: CallProfile, tier: TenantTier, enableToolUse: boolean): boolean {
  if (enableToolUse) return true;       // tool-use only via MCP
  if (profile === "fast") return false; // fast UX → API streaming
  // profile=heavy → check tier mcpAccess
  try {
    return getPlan(tier).features.mcpAccess;
  } catch {
    return false;
  }
}
