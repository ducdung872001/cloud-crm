import { useState } from "react";
import { Modal, Field, Textarea } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TechLeadPromptModal({ open, onClose }: Props) {
  const { showToast } = useApp();
  const [prompt, setPrompt] = useState(`TECH STACK:
- Next.js 14 App Router
- Tailwind + shadcn/ui
- React Query + Zustand

CODING RULES:
- Component tối đa 200 lines
- Không hardcode API URL (dùng env)
- ErrorBoundary top-level
- i18n: vi + en, key dạng camelCase
- Test coverage target: 70%

CONVENTIONS:
- Naming: PascalCase cho component, camelCase cho function
- Import order: built-in → external → internal (absolute) → relative
- Export default cho component, named export cho utility
- Commit message: Conventional Commits`);
  const { submitting, submit } = useFormStub("Đã duyệt prompt bổ sung", "Claude Agent sẽ apply khi chạy");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tech Lead prompt (Checkpoint 3)"
      kicker="STAGE 4 · PROMPT AUDIT"
      sub="Prompt được version control. Mọi thay đổi ghi audit log. Agent đọc prompt này trước khi scaffold."
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn" onClick={() => showToast("info", "Lưu draft", "Chưa áp dụng cho agent")}>
            Lưu draft
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang ký..." : "Ký duyệt & áp dụng →"}
          </button>
        </>
      }
    >
      <div
        style={{
          padding: 10,
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: 8,
          fontSize: 12,
          color: "var(--slate-700)",
          marginBottom: 14,
          display: "flex",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 18 }}>⚠</span>
        <div>
          <strong>Checkpoint Human-in-the-loop.</strong> Prompt này constraint cách AI scaffold + viết code. Sai sẽ phải rollback commits. Review kỹ.
        </div>
      </div>

      <Field label="Prompt content (Markdown)" required>
        <Textarea className="mono" value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ minHeight: 300 }} />
      </Field>

      <div style={{ fontSize: 11, color: "var(--slate-500)", marginBottom: 10 }}>
        Token count: ~280 · Model: Claude Opus 4.7 · Lần sửa gần nhất: 18/04 15:20 (An Đức)
      </div>

      <div
        style={{
          padding: 10,
          background: "var(--slate-50)",
          borderRadius: 8,
          fontSize: 12,
        }}
      >
        <strong>Version history:</strong>
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--slate-600)" }}>
          v3 · 18/04 15:20 · An Đức · "Thêm i18n rule"
          <br />
          v2 · 17/04 22:10 · An Đức · "Giới hạn component size"
          <br />
          v1 · 17/04 09:45 · An Đức · "Initial tech prompt"
        </div>
      </div>
    </Modal>
  );
}
