import { useState } from "react";
import { Modal, Field, Input, Textarea, Checkbox, Select } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserManualModal({ open, onClose }: Props) {
  const [title, setTitle] = useState("User Manual — Content Manager");
  const [audience, setAudience] = useState("content-manager");
  const [chapters, setChapters] = useState(
    "1. Giới thiệu\n2. Đăng nhập và quyền\n3. Quản lý màn hình\n4. Tạo campaign\n5. Lập lịch phát\n6. Báo cáo uptime\n7. Troubleshooting FAQ"
  );
  const [format, setFormat] = useState("pdf");
  const { submitting, submit } = useFormStub("Đã sinh user manual", "AI đang tạo screenshot + content...");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sinh User Manual"
      kicker="STAGE 7 · DOC"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn ai" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang generate..." : "✦ Sinh manual"}
          </button>
        </>
      }
    >
      <Field label="Tiêu đề" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Target audience">
        <Select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          options={[
            { value: "content-manager", label: "Content Manager (nội dung màn hình)" },
            { value: "store-ops", label: "Store Operator (vận hành site)" },
            { value: "admin", label: "Admin / IT (quản trị hệ thống)" },
            { value: "end-user", label: "End user (chung)" },
            { value: "developer", label: "Developer (API docs)" },
          ]}
        />
      </Field>

      <Field label="Cấu trúc chương" help="Mỗi dòng là 1 chương. Có thể để AI đề xuất.">
        <Textarea value={chapters} onChange={(e) => setChapters(e.target.value)} style={{ minHeight: 140 }} />
      </Field>

      <Field label="Format output">
        <Select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          options={[
            { value: "pdf", label: "PDF (in đẹp, có TOC)" },
            { value: "docx", label: "Word (.docx, edit được)" },
            { value: "html", label: "HTML web (navigation sidebar)" },
            { value: "markdown", label: "Markdown (cho doc site)" },
            { value: "notion", label: "Export sang Notion page" },
          ]}
        />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>AI sẽ tự động</div>
      <Checkbox label="Tạo screenshot cho từng bước" defaultChecked />
      <Checkbox label="Highlight element (đóng khung + mũi tên)" defaultChecked />
      <Checkbox label="Sinh FAQ từ feedback KH + bug history" defaultChecked />
      <Checkbox label="Table of contents + index" defaultChecked />
      <Checkbox label="Cả tiếng Việt + tiếng Anh" defaultChecked />
      <Checkbox label="Accessibility notes (cho user khiếm thị)" />

      <div
        style={{
          marginTop: 12,
          padding: 10,
          background: "var(--slate-50)",
          borderRadius: 8,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
        }}
      >
        Ước tính: 3-5 phút · ~$1.80 · Opus 4.7 + Puppeteer screenshot
      </div>
    </Modal>
  );
}
