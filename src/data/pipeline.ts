export interface PipelineStep {
  num: number;
  code: string;
  label: string;
  status: "ai" | "hu";
  ribbon: string;
  kicker: string;
  title: string;
  desc: string;
}

export const PIPELINE: PipelineStep[] = [
  {
    num: 1,
    code: "01",
    label: "Khảo sát & Meeting",
    status: "ai",
    ribbon: "① KHẢO SÁT & TIẾP NHẬN YÊU CẦU",
    kicker: "Stage 01 · Meeting session",
    title: "Upload ghi âm cuộc họp",
    desc: "Chọn loại meeting để AI xử lý đúng context. Từ lần thứ 2 trở đi, AI so sánh với URD hiện tại và chỉ sinh phần thay đổi.",
  },
  {
    num: 2,
    code: "02",
    label: "URD / SA",
    status: "ai",
    ribbon: "② PHÂN TÍCH YÊU CẦU",
    kicker: "URD diff · Sinh từ Meeting",
    title: "Thay đổi URD từ lần họp gần nhất",
    desc: "AI phát hiện các thay đổi từ transcript, sinh structured diff, gắn với đoạn thoại cụ thể để traceability.",
  },
  {
    num: 3,
    code: "03",
    label: "Prototype",
    status: "ai",
    ribbon: "③ LÊN BẢN MẪU PROTOTYPE",
    kicker: "Stage 03 · Visual Prototype",
    title: "HTML Prototype",
    desc: "Claude sinh bản mẫu HTML theo URD đã duyệt, preview iframe, share link cho KH, collect comments trên UI.",
  },
  {
    num: 4,
    code: "04",
    label: "Frontend + DevOps",
    status: "ai",
    ribbon: "④ PHÁT TRIỂN FRONTEND + DEVOPS",
    kicker: "Stage 04 · Frontend Production",
    title: "AI Coding Agent · Frontend",
    desc: "Claude Code CLI chạy headless, thao tác trực tiếp trên repo. Dev/Tech Lead bổ sung prompt, AI scaffold + build + commit.",
  },
  {
    num: 5,
    code: "05",
    label: "Backend + DevOps",
    status: "ai",
    ribbon: "⑤ PHÁT TRIỂN BACKEND + DEVOPS",
    kicker: "Stage 05 · Backend Production",
    title: "AI Coding Agent · Backend + API",
    desc: "Claude Code xử lý Spring Boot / Vert.x. Sinh API, entity, service, JOOQ codegen, unit test. Loop hai chiều với FE đồng bộ contract.",
  },
  {
    num: 6,
    code: "06",
    label: "Test & QA",
    status: "hu",
    ribbon: "⑥ TEST CASE · UNIT TEST · QA",
    kicker: "Stage 06 · Quality Assurance",
    title: "Testing · AI sinh + QA review",
    desc: "Claude sinh test case từ URD, QA review và chạy manual test. Unit test được sinh song song với code.",
  },
  {
    num: 7,
    code: "07",
    label: "Bàn giao",
    status: "hu",
    ribbon: "⑦ QA & CHUYỂN GIAO SẢN PHẨM",
    kicker: "Stage 07 · Handover",
    title: "Bàn giao cho khách hàng",
    desc: "AI sinh release note, user manual, training deck. PM chốt UAT, team triển khai đến site KH, ký biên bản nghiệm thu.",
  },
];

export function findStage(num: number): PipelineStep | undefined {
  return PIPELINE.find((s) => s.num === num);
}
