import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Textarea, Chips, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function RegeneratePrototypeModal({ open, onClose }: Props) {
  const [scope, setScope] = useState<"full" | "section" | "page">("section");
  const [references, setReferences] = useState<string[]>([]);
  const [styleGuide, setStyleGuide] = useState("minimal");
  const [prompt, setPrompt] = useState(
    "Apply feedback #1 (trend 7 ngày cho card Online), feedback #2 (filter thành phố cho bản đồ), feedback #3 (cột doanh thu ước tính)."
  );
  const [keepFeedback, setKeepFeedback] = useState(true);
  const { submitting, submit } = useFormStub("Đang regenerate...", "Claude Opus 4.7 — ước tính 18s · $0.40");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Regenerate prototype"
      kicker="STAGE 3 · AI"
      sub="Sinh lại HTML từ URD + feedback + reference"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn ai" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang chạy..." : "✦ Regenerate ($0.40)"}
          </button>
        </>
      }
    >
      <Field label="Phạm vi" required>
        <div style={{ display: "flex", gap: 8 }}>
          {(["full", "section", "page"] as const).map((s) => (
            <button key={s} type="button" className={`filter-chip ${scope === s ? "active" : ""}`} onClick={() => setScope(s)}>
              {s === "full" ? "Toàn bộ prototype" : s === "section" ? "Theo section" : "1 page"}
            </button>
          ))}
        </div>
      </Field>

      <FieldRow>
        <Field label="Style guide">
          <Select
            value={styleGuide}
            onChange={(e) => setStyleGuide(e.target.value)}
            options={[
              { value: "minimal", label: "Minimal (Linear / Raycast)" },
              { value: "editorial", label: "Editorial (Stripe / Apple)" },
              { value: "enterprise", label: "Enterprise (Salesforce / SAP)" },
              { value: "playful", label: "Playful (Notion / Figma)" },
              { value: "brand", label: "Match brand guide của KH" },
            ]}
          />
        </Field>
        <Field label="Reference URLs" help="Enter để thêm">
          <Chips value={references} onChange={setReferences} placeholder="https://..." />
        </Field>
      </FieldRow>

      <Field label="Prompt bổ sung cho AI">
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ minHeight: 100 }} />
      </Field>

      <Field label="Style guide upload">
        <div className="upload-zone" style={{ padding: 16 }}>
          <div className="field-help">Kéo thả brand guide (.pdf / .fig) hoặc ảnh reference</div>
        </div>
      </Field>

      <Checkbox
        label="Giữ feedback pin location"
        help="Comment của KH vẫn giữ đúng vị trí (coordinate) trong version mới"
        checked={keepFeedback}
        onChange={setKeepFeedback}
      />

      <div
        style={{
          marginTop: 12,
          padding: 10,
          background: "rgba(20,184,166,0.05)",
          borderRadius: 8,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
        }}
      >
        Ước tính: 18s · $0.40 · Input 8k tokens · Output 32k tokens
      </div>

      <Input type="hidden" value={scope} readOnly />
    </Modal>
  );
}
