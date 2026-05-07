import { config } from "../config.js";

/**
 * MCP client — wrap connection tới Claude Code CLI exposed như MCP host.
 *
 * Production setup (1 máy local hoặc K8s pod):
 *   $ claude --mcp-server-listen 0.0.0.0:7000 --auth-token $MCP_TOKEN
 *
 * BE gateway sẽ POST tới `${MCP_ENDPOINT}/v1/invoke` với body:
 *   { tool: "claude.messages", input: { model, system, user, ... } }
 *
 * Phía MCP host parse + forward sang Claude Code CLI internal subprocess —
 * tận dụng được session caching + tool-use builtin của Claude Code (file
 * read, bash, etc.) mà API token không có.
 *
 * Health check: cron 60s GET /health → cập nhật `mcpHealthy`. Circuit breaker
 * open khi 3 failure liên tiếp; half-open sau 60s; close khi 1 success.
 */

let mcpHealthy = false;
let consecutiveFailures = 0;
let circuitOpenUntil = 0;

const FAILURE_THRESHOLD = 3;
const CIRCUIT_OPEN_MS = 60_000;

export function isMcpEnabled(): boolean {
  return config.mcp.endpoint !== "";
}

export function isMcpAvailable(): boolean {
  if (!isMcpEnabled()) return false;
  if (Date.now() < circuitOpenUntil) return false; // circuit open
  return mcpHealthy;
}

export interface McpInvokeInput {
  /** Tool name registered ở MCP host. Default: "claude.messages" */
  tool?: string;
  modelId: string;
  systemText: string;
  userText: string;
  maxTokens?: number;
  /** Có dùng tool-use không (file/bash/web) — chỉ MCP support */
  enableToolUse?: boolean;
}

export interface McpInvokeResult {
  text: string;
  tokensIn: number;
  tokensOut: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  /** Tool calls thực hiện (nếu enableToolUse) */
  toolCalls?: { tool: string; durationMs: number }[];
  durationMs: number;
}

export async function invokeMcp(input: McpInvokeInput): Promise<McpInvokeResult> {
  if (!isMcpAvailable()) throw new Error("[mcp] not available (disabled or circuit open)");

  const start = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), config.mcp.timeoutMs);

  try {
    const res = await fetch(`${config.mcp.endpoint}/v1/invoke`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(config.mcp.token ? { authorization: `Bearer ${config.mcp.token}` } : {}),
      },
      body: JSON.stringify({
        tool: input.tool ?? "claude.messages",
        input: {
          model: input.modelId,
          system: input.systemText,
          user: input.userText,
          max_tokens: input.maxTokens ?? 2000,
          enable_tools: input.enableToolUse ?? false,
        },
      }),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      bumpFailure();
      const text = await res.text();
      throw new Error(`[mcp] ${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      text: string;
      usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number };
      tool_calls?: { tool: string; duration_ms: number }[];
    };
    resetFailure();
    return {
      text: data.text,
      tokensIn: data.usage.input_tokens,
      tokensOut: data.usage.output_tokens,
      cacheReadTokens: data.usage.cache_read_input_tokens ?? 0,
      cacheWriteTokens: data.usage.cache_creation_input_tokens ?? 0,
      toolCalls: data.tool_calls?.map((t) => ({ tool: t.tool, durationMs: t.duration_ms })),
      durationMs: Date.now() - start,
    };
  } catch (e) {
    bumpFailure();
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function bumpFailure() {
  consecutiveFailures++;
  if (consecutiveFailures >= FAILURE_THRESHOLD) {
    circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS;
    mcpHealthy = false;
    console.warn(`[mcp] circuit OPEN until ${new Date(circuitOpenUntil).toISOString()} (${consecutiveFailures} failures)`);
  }
}

function resetFailure() {
  consecutiveFailures = 0;
  circuitOpenUntil = 0;
  mcpHealthy = true;
}

/** Health check — gọi 60s/lần từ cron tick. */
export async function checkMcpHealth(): Promise<boolean> {
  if (!isMcpEnabled()) return false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5_000);
    const res = await fetch(`${config.mcp.endpoint}/health`, { signal: ctrl.signal });
    clearTimeout(t);
    mcpHealthy = res.ok;
    if (res.ok && circuitOpenUntil > 0 && Date.now() >= circuitOpenUntil) {
      // Half-open success → close circuit
      resetFailure();
    }
    return mcpHealthy;
  } catch {
    mcpHealthy = false;
    return false;
  }
}

export function mcpStatus() {
  return {
    enabled: isMcpEnabled(),
    healthy: mcpHealthy,
    consecutiveFailures,
    circuitOpenUntil: circuitOpenUntil ? new Date(circuitOpenUntil).toISOString() : null,
  };
}
