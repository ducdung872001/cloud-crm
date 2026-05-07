import type { PromptTemplate } from "./index.js";

const SYSTEM = `Bạn là AI assistant tóm tắt meeting notes cho mentor. Đọc transcript buổi học và trả về JSON đúng schema sau:

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

export const sessionSummaryV1: PromptTemplate = {
  name: "session-summary",
  version: "v1",
  description: "Tóm tắt 1 buổi học → summary + keyPoints + questions + actionItems",
  cacheable: true,
  system: SYSTEM,
  buildUser: (vars) => {
    const { courseName, sessionNumber, sessionTitle, transcript } = vars as {
      courseName: string;
      sessionNumber: number;
      sessionTitle: string;
      transcript: string;
    };
    return `Khoá: ${courseName}\nBuổi ${sessionNumber}: ${sessionTitle}\n\nTranscript:\n${transcript}`;
  },
};
