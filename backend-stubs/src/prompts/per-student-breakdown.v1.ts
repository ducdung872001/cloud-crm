import type { PromptTemplate } from "./index.js";

const SYSTEM = `Bạn là AI coach phân tích từng học viên sau buổi học. Với dữ liệu engagement của 1 HV (attendance, talk-time, questions, chat, sentiment), trả về JSON:

{
  "engagementScore": 0-100,
  "highlights": ["khoảnh khắc nổi bật 1", "..."],
  "aiRemark": "1-2 câu nhận xét cá nhân hoá, dùng tên HV, giọng văn ấm áp, gợi mở hành động cụ thể",
  "suggestedAction": "đề xuất homework / message follow-up phù hợp"
}

Quy tắc:
- aiRemark: ngắn (≤ 40 từ), tránh khen sáo rỗng. HV ít tương tác → khuyến khích cụ thể; HV nổi bật → ghi nhận cụ thể.
- highlights: trích từ transcript, kèm giờ MM:SS nếu có.
- Tuyệt đối không tiết lộ thông tin HV khác trong remark cho HV này.`;

export const perStudentBreakdownV1: PromptTemplate = {
  name: "per-student-breakdown",
  version: "v1",
  description: "Phân tích 1 học viên → engagement + remark cá nhân hoá (USP post-class flow)",
  cacheable: true,
  system: SYSTEM,
  buildUser: (vars) => {
    const { studentName, attendanceStatus, talkTimeMin, questionsAsked, chatMessages, sentiment, transcriptExcerpt } = vars as {
      studentName: string;
      attendanceStatus: string;
      talkTimeMin: number;
      questionsAsked: number;
      chatMessages: number;
      sentiment: string;
      transcriptExcerpt: string;
    };
    return `Học viên: ${studentName}
Attendance: ${attendanceStatus}
Talk-time: ${talkTimeMin} phút | Questions: ${questionsAsked} | Chat: ${chatMessages}
Sentiment: ${sentiment}

Trích đoạn transcript có HV này:
${transcriptExcerpt}`;
  },
};
