import { config } from "../config.js";

/**
 * Wrapper cho Anthropic API (Claude) — summarize transcript.
 *
 * Default: Haiku 4.5 (rẻ, đủ chất lượng). Sonnet 4.6 cho Unlimited plan.
 *
 * Prompt caching: cache system prompt (format template + example) để giảm 90%
 * cost input token từ lần gọi thứ 2 trở đi.
 */

const SYSTEM_PROMPT = `Bạn là AI assistant tóm tắt meeting notes cho mentor. Đọc transcript buổi học và trả về JSON đúng schema sau:

{
  "summary": "Tóm tắt 2-3 câu bằng tiếng Việt tự nhiên, không liệt kê bullet",
  "keyPoints": [{ "time": "MM:SS", "text": "Điểm chính trong 1 câu ngắn" }],
  "questions": [{ "time": "MM:SS", "student": "Tên HV", "q": "câu hỏi", "a": "câu trả lời" }],
  "actionItems": ["Action item 1 cho học viên", "Action item 2..."]
}

Quy tắc:
- keyPoints: 5-8 điểm, mỗi điểm ≤ 15 từ
- Chỉ trích xuất Q&A chất lượng (có trả lời thực sự, không chỉ "dạ em hiểu rồi")
- actionItems: cụ thể, kèm deadline nếu mentor có nói
- Giữ tiếng Việt tự nhiên, tránh dịch máy`;

export interface SummarizeRequest {
  transcript: string;
  courseName: string;
  sessionNumber: number;
  sessionTitle: string;
  model?: "haiku" | "sonnet";
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
}

export async function summarize(req: SummarizeRequest): Promise<SummarizeResult> {
  if (!config.anthropic.apiKey) {
    return mockSummary(req);
  }
  const model = req.model === "sonnet" ? "claude-sonnet-4-6" : "claude-haiku-4-5";

  // POST https://api.anthropic.com/v1/messages
  // body: {
  //   model,
  //   max_tokens: 2000,
  //   system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
  //   messages: [{ role: "user", content: userContent }],
  // }
  // TODO: real fetch

  return mockSummary(req);
}

function mockSummary(req: SummarizeRequest): SummarizeResult {
  const tokensIn = Math.ceil(req.transcript.length / 4);
  const tokensOut = 800;
  const model = req.model === "sonnet" ? "sonnet-4-6" : "haiku-4-5";
  const pricePerTokenIn = model === "sonnet-4-6" ? 3 / 1_000_000 : 1 / 1_000_000;
  const pricePerTokenOut = model === "sonnet-4-6" ? 15 / 1_000_000 : 5 / 1_000_000;

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
    costUSD: tokensIn * pricePerTokenIn + tokensOut * pricePerTokenOut,
    model,
  };
}

export function estimateCost(tokensIn: number, tokensOut: number, model: "haiku" | "sonnet"): number {
  const inRate = model === "sonnet" ? 3 / 1_000_000 : 1 / 1_000_000;
  const outRate = model === "sonnet" ? 15 / 1_000_000 : 5 / 1_000_000;
  return tokensIn * inRate + tokensOut * outRate;
}
