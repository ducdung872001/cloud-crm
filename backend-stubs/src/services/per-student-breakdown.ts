import { config } from "../config.js";
import { getModel, type TenantTier } from "../config/models.js";
import { getPrompt } from "../prompts/index.js";
import { callAnthropic } from "./anthropic-client.js";
import { logClaudeUsage } from "./usage-log.js";

/**
 * Orchestrator: nhận transcript + danh sách HV → call Claude/per-student-breakdown.v1
 * cho từng HV → trả mảng kết quả.
 *
 * Shape khớp `PerStudentBreakdown` ở FE mocks/mentorhub/index.ts để FE có thể
 * swap mock → live không phải đổi component.
 *
 * Mock mode (no ANTHROPIC_API_KEY): trả mock có shape đúng, dữ liệu placeholder.
 *
 * Concurrency: 4 students song song (không quá tải rate limit Anthropic, hợp lý
 * cho lớp ~30 HV → ~8 batch).
 */

export interface StudentInput {
  studentId: string;
  name: string;
  /** Optional rich data nếu engine đã pre-compute từ transcript */
  attendanceStatus?: "present" | "late" | "absent";
  talkTimeMin?: number;
  questionsAsked?: number;
  chatMessages?: number;
  sentiment?: "positive" | "neutral" | "negative";
  /** Chỉ trích đoạn transcript có HV này — giảm token */
  transcriptExcerpt?: string;
}

export interface PerStudentBreakdownItem {
  studentId: string;
  name: string;
  short: string;
  avatarBg: string;
  engagementScore: number;
  attendanceStatus: "present" | "late" | "absent";
  talkTimeMin: number;
  questionsAsked: number;
  chatMessages: number;
  sentiment: "positive" | "neutral" | "negative";
  highlights: string[];
  aiRemark: string;
  /** Suggested next-action gợi ý cho mentor (không lộ ra HV) */
  suggestedAction: string;
  zaloChannel: string;
  zaloStatus: "scheduled" | "needs_review" | "sent" | "failed";
  scheduledAt: string;
}

export interface BreakdownRequest {
  transcript: string;
  courseName: string;
  sessionNumber: number;
  sessionTitle: string;
  students: StudentInput[];
  model?: string;
  tier?: TenantTier;
  promptVersion?: string;
  mentorId?: string;
  tenantId?: string;
  sessionId?: string;
  /** Default "needs_review" — nếu plan có auto-send thì set "scheduled" */
  defaultZaloStatus?: PerStudentBreakdownItem["zaloStatus"];
  /** Concurrency (default 4) */
  concurrency?: number;
}

const AVATAR_BG = ["#0F766E", "#B45309", "#7C3AED", "#0369A1", "#BE123C", "#15803D", "#A16207", "#1E40AF"];

export async function runPerStudentBreakdown(req: BreakdownRequest): Promise<PerStudentBreakdownItem[]> {
  const modelAlias = req.model ?? "haiku";
  const model = getModel(modelAlias);
  const tier: TenantTier = req.tier ?? "free";
  if (!model.access.includes(tier)) {
    throw new Error(`[per-student] Model ${model.alias} không khả dụng cho tier ${tier}`);
  }
  const prompt = getPrompt("per-student-breakdown", req.promptVersion ?? "v1");
  const concurrency = Math.max(1, req.concurrency ?? 4);
  const defaultStatus = req.defaultZaloStatus ?? "needs_review";

  const results: PerStudentBreakdownItem[] = new Array(req.students.length);

  let cursor = 0;
  async function worker(workerId: number) {
    while (true) {
      const i = cursor++;
      if (i >= req.students.length) return;
      const stu = req.students[i]!;
      results[i] = await processOne(req, prompt, model, stu, defaultStatus, i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, (_, w) => worker(w)));

  return results;
}

async function processOne(
  req: BreakdownRequest,
  prompt: ReturnType<typeof getPrompt>,
  model: ReturnType<typeof getModel>,
  stu: StudentInput,
  defaultStatus: PerStudentBreakdownItem["zaloStatus"],
  idx: number,
): Promise<PerStudentBreakdownItem> {
  const baseShape = baseStudentShape(stu, idx, defaultStatus);

  if (!config.anthropic.apiKey) {
    return { ...baseShape, ...mockAiOutput(stu) };
  }

  const userText = prompt.buildUser!({
    studentName: stu.name,
    attendanceStatus: stu.attendanceStatus ?? "present",
    talkTimeMin: stu.talkTimeMin ?? 0,
    questionsAsked: stu.questionsAsked ?? 0,
    chatMessages: stu.chatMessages ?? 0,
    sentiment: stu.sentiment ?? "neutral",
    transcriptExcerpt: stu.transcriptExcerpt ?? req.transcript.slice(0, 4000),
  });

  const apiResult = await callAnthropic({
    modelId: model.id,
    systemText: prompt.system,
    userText,
    cacheable: prompt.cacheable && model.supportsCaching,
    maxTokens: 600,
    jsonMode: true,
  });

  const parsed = safeJSON<{
    engagementScore?: number;
    highlights?: string[];
    aiRemark?: string;
    suggestedAction?: string;
  }>(apiResult.text);

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
      step: "per_student_breakdown",
    });
  }

  return {
    ...baseShape,
    engagementScore: clamp(parsed?.engagementScore ?? baseShape.engagementScore, 0, 100),
    highlights: parsed?.highlights ?? [],
    aiRemark: parsed?.aiRemark ?? "",
    suggestedAction: parsed?.suggestedAction ?? "",
  };
}

function baseStudentShape(
  stu: StudentInput,
  idx: number,
  defaultStatus: PerStudentBreakdownItem["zaloStatus"],
): PerStudentBreakdownItem {
  const short = stu.name.split(" ").pop()?.slice(0, 2).toUpperCase() ?? "??";
  return {
    studentId: stu.studentId,
    name: stu.name,
    short,
    avatarBg: AVATAR_BG[idx % AVATAR_BG.length]!,
    engagementScore: deriveEngagementScore(stu),
    attendanceStatus: stu.attendanceStatus ?? "present",
    talkTimeMin: stu.talkTimeMin ?? 0,
    questionsAsked: stu.questionsAsked ?? 0,
    chatMessages: stu.chatMessages ?? 0,
    sentiment: stu.sentiment ?? "neutral",
    highlights: [],
    aiRemark: "",
    suggestedAction: "",
    zaloChannel: "OA-MENTORHUB",
    zaloStatus: defaultStatus,
    scheduledAt: new Date(Date.now() + 30 * 60_000).toISOString(),
  };
}

function deriveEngagementScore(stu: StudentInput): number {
  // Crude default khi LLM không trả: weighted của các signal
  if (stu.attendanceStatus === "absent") return 0;
  const talk = Math.min(40, (stu.talkTimeMin ?? 0) * 4);
  const q = Math.min(30, (stu.questionsAsked ?? 0) * 10);
  const chat = Math.min(20, (stu.chatMessages ?? 0) * 2);
  const late = stu.attendanceStatus === "late" ? -10 : 0;
  return clamp(40 + talk + q + chat + late, 0, 100);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function mockAiOutput(stu: StudentInput) {
  return {
    highlights: [
      `Tham gia ${stu.attendanceStatus ?? "present"}, đặt ${stu.questionsAsked ?? 0} câu hỏi`,
    ],
    aiRemark: `[MOCK] ${stu.name}, em đã ${stu.attendanceStatus === "absent" ? "vắng buổi này — xem lại link nhé" : "tham gia tốt — giữ phong độ"}.`,
    suggestedAction: stu.attendanceStatus === "absent" ? "Gửi link xem lại" : "Gửi homework follow-up",
  };
}

function safeJSON<T>(text: string): T | null {
  try { return JSON.parse(text) as T; } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]) as T; } catch { return null; }
}
