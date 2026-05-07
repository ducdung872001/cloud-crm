import type { PromptTemplate } from "./index.js";

const SYSTEM = `Bạn soạn message Zalo OA cá nhân hoá gửi học viên sau buổi học. Đầu vào là remark + suggested action từ AI breakdown. Trả về JSON:

{
  "title": "tiêu đề ZNS ngắn ≤ 30 ký tự",
  "body": "nội dung ZNS ≤ 250 ký tự, gọi tên HV, đầu thân thiện, đóng bằng CTA cụ thể",
  "cta": "nội dung nút (ví dụ: 'Xem bài tập', 'Nhắc lại buổi học')"
}

Quy tắc:
- Văn phong tiếng Việt thân thiện, không sến.
- Không hứa hẹn quá đà, không câu khách.
- Nếu HV vắng → tone đồng cảm, kèm link xem lại.
- Nếu HV nổi bật → ghi nhận cụ thể điểm tốt.`;

export const zaloOutboundV1: PromptTemplate = {
  name: "zalo-outbound",
  version: "v1",
  description: "Soạn message Zalo OA cá nhân hoá từ AI breakdown của HV",
  cacheable: true,
  system: SYSTEM,
  buildUser: (vars) => {
    const { studentName, aiRemark, suggestedAction, courseName, sessionNumber } = vars as {
      studentName: string;
      aiRemark: string;
      suggestedAction: string;
      courseName: string;
      sessionNumber: number;
    };
    return `HV: ${studentName}
Khoá: ${courseName} — Buổi ${sessionNumber}
AI remark: ${aiRemark}
Suggested action: ${suggestedAction}`;
  },
};
