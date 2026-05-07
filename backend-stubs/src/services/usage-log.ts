import { v4 as uuid } from "uuid";
import { db } from "../db/store.js";
import type { UsageLog } from "../db/types.js";
import { estimateCostUSD as registryCost, getModel } from "../config/models.js";

/**
 * Centralized usage logger — gọi sau MỌI provider call (Claude / Whisper / Zalo / Storage).
 *
 * Cost luôn lấy từ registry → một nguồn truth duy nhất.
 *
 * Usage:
 *   logClaudeUsage({ mentorId, sessionId, modelId, tokensIn, tokensOut, cacheReadTokens, promptVersion });
 *   logWhisperUsage({ mentorId, sessionId, provider, audioSeconds });
 *   logZaloPushUsage({ mentorId, sessionId, count });
 *   logStorageUsage({ mentorId, mb });
 */

const USD_TO_VND = 25_000;

export interface ClaudeUsageInput {
  tenantId?: string;
  mentorId: string;
  sessionId?: string;
  /** Canonical model id (claude-haiku-4-5, gpt-4o, ...) */
  modelId: string;
  promptVersion?: string;
  tokensIn: number;
  tokensOut: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  durationMs?: number;
  /** Override step nếu là per-student-breakdown thay vì summary */
  step?: "claude" | "per_student_breakdown";
}

export function logClaudeUsage(input: ClaudeUsageInput): UsageLog {
  // Validate model exists in registry — fail fast nếu mismatch
  getModel(input.modelId);
  const costUSD = registryCost(
    input.modelId,
    input.tokensIn,
    input.tokensOut,
    input.cacheReadTokens ?? 0,
    input.cacheWriteTokens ?? 0,
  );
  const log: UsageLog = {
    id: uuid(),
    tenantId: input.tenantId,
    mentorId: input.mentorId,
    sessionId: input.sessionId,
    step: input.step ?? "claude",
    model: input.modelId,
    promptVersion: input.promptVersion,
    tokensIn: input.tokensIn,
    tokensOut: input.tokensOut,
    cacheReadTokens: input.cacheReadTokens,
    cacheWriteTokens: input.cacheWriteTokens,
    costUSD,
    costVND: costUSD * USD_TO_VND,
    durationMs: input.durationMs,
    createdAt: new Date().toISOString(),
  };
  db.usageLogs.push(log);
  return log;
}

export interface WhisperUsageInput {
  tenantId?: string;
  mentorId: string;
  sessionId?: string;
  /** Provider id ("groq" | "openai") — map vào registry */
  provider: "groq" | "openai";
  audioSeconds: number;
  durationMs?: number;
}

const WHISPER_PER_SEC: Record<string, number> = {
  groq: 0.0000056,    // $0.02/hour
  openai: 0.0001,     // $0.006/min
};

export function logWhisperUsage(input: WhisperUsageInput): UsageLog {
  const perSec = WHISPER_PER_SEC[input.provider];
  const costUSD = input.audioSeconds * perSec;
  const log: UsageLog = {
    id: uuid(),
    tenantId: input.tenantId,
    mentorId: input.mentorId,
    sessionId: input.sessionId,
    step: "whisper",
    model: input.provider === "groq" ? "whisper-large-v3-turbo" : "whisper-1",
    audioSeconds: input.audioSeconds,
    costUSD,
    costVND: costUSD * USD_TO_VND,
    durationMs: input.durationMs,
    createdAt: new Date().toISOString(),
  };
  db.usageLogs.push(log);
  return log;
}

export interface ZaloPushUsageInput {
  tenantId?: string;
  mentorId: string;
  sessionId?: string;
  /** Số tin gửi trong batch (1 = single push) */
  count: number;
  /** Cost / message — placeholder; tuỳ ZNS pricing thực */
  costUSDPerMessage?: number;
}

export function logZaloPushUsage(input: ZaloPushUsageInput): UsageLog {
  const perMsg = input.costUSDPerMessage ?? 0.012; // ~300đ/tin placeholder
  const costUSD = input.count * perMsg;
  const log: UsageLog = {
    id: uuid(),
    tenantId: input.tenantId,
    mentorId: input.mentorId,
    sessionId: input.sessionId,
    step: "zalo_push",
    costUSD,
    costVND: costUSD * USD_TO_VND,
    createdAt: new Date().toISOString(),
  };
  db.usageLogs.push(log);
  return log;
}

export interface StorageUsageInput {
  tenantId?: string;
  mentorId: string;
  sessionId?: string;
  mb: number;
  /** S3 standard ~$0.023/GB/tháng */
  costUSDPerGB?: number;
}

export function logStorageUsage(input: StorageUsageInput): UsageLog {
  const perGB = input.costUSDPerGB ?? 0.023;
  const costUSD = (input.mb / 1024) * perGB;
  const log: UsageLog = {
    id: uuid(),
    tenantId: input.tenantId,
    mentorId: input.mentorId,
    sessionId: input.sessionId,
    step: "storage",
    costUSD,
    costVND: costUSD * USD_TO_VND,
    createdAt: new Date().toISOString(),
  };
  db.usageLogs.push(log);
  return log;
}
