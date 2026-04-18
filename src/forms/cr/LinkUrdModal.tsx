import { Modal, Checkbox } from "../../components/ui";
import { useState } from "react";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
  crCode?: string;
}

const PROPOSED = [
  { id: "1", section: "§ 6.1 Internationalization", op: "add", content: "Hệ thống hỗ trợ tiếng Anh cho admin UI" },
  { id: "2", section: "§ 6.2 Content language", op: "add", content: "Content màn hình cho phép attach version tiếng Hàn" },
  { id: "3", section: "§ 2.3 Screen", op: "modify", content: "Thêm field `content_language` cho từng asset" },
  { id: "4", section: "§ 3.5 Admin UI", op: "modify", content: "Switcher ngôn ngữ ở topbar" },
];

export default function LinkUrdModal({ open, onClose, crCode = "CR-003" }: Props) {
  const [apply, setApply] = useState<string[]>(PROPOSED.map((p) => p.id));
  const { submitting, submit } = useFormStub("Đã apply CR vào URD", "URD tự động bump version");

  const toggle = (id: string) => setApply((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Apply ${crCode} vào URD`}
      kicker="CR · URD LINK"
      sub="AI đề xuất các thay đổi URD. Tick mục nào muốn apply."
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || apply.length === 0} onClick={() => submit(onClose)}>
            {submitting ? "Đang apply..." : `Apply ${apply.length} thay đổi`}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PROPOSED.map((p) => (
          <label
            key={p.id}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 120px 1fr",
              gap: 10,
              padding: 12,
              background: apply.includes(p.id) ? "rgba(20,184,166,0.05)" : "var(--slate-50)",
              border: `1px solid ${apply.includes(p.id) ? "var(--teal-500)" : "var(--slate-200)"}`,
              borderRadius: 8,
              cursor: "pointer",
              alignItems: "center",
              fontSize: 12,
            }}
          >
            <input type="checkbox" checked={apply.includes(p.id)} onChange={() => toggle(p.id)} />
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--slate-500)" }}>{p.section}</div>
              <span className={`tag ${p.op === "add" ? "tag-ok" : "tag-warn"}`} style={{ marginTop: 4 }}>
                {p.op === "add" ? "+ Add" : "~ Modify"}
              </span>
            </div>
            <div>{p.content}</div>
          </label>
        ))}
      </div>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "16px 0 6px" }}>Hành động sau khi apply</div>
      <Checkbox label="URD bump version (v1.3 → v1.4)" defaultChecked />
      <Checkbox label="Tạo traceability từ FR mới về CR này" defaultChecked />
      <Checkbox label="Thông báo Dev/QA review impact" defaultChecked />
      <Checkbox label="Tự động sinh test case cho requirement mới" defaultChecked />
    </Modal>
  );
}
