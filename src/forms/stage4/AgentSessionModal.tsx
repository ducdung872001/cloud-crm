import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Textarea, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AgentSessionModal({ open, onClose }: Props) {
  const [model, setModel] = useState("opus");
  const [maxTokens, setMaxTokens] = useState("64000");
  const [contextBudget, setContextBudget] = useState("200000");
  const [permMode, setPermMode] = useState<"acceptEdits" | "plan" | "bypass">("acceptEdits");
  const [objective, setObjective] = useState(
    "Scaffold Next.js project theo URD v1.3 + prompt constraint. Priority: Dashboard, Screens list, Campaign editor."
  );
  const { submitting, submit } = useFormStub("Đã launch Claude Code session", "Streaming output sẽ hiện trong live session panel");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Launch Claude Code session"
      kicker="STAGE 4 · AGENT"
      sub="Agent chạy headless trên repo. Commit được gắn label agent-generated."
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn ai" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang launch..." : "▶ Run agent"}
          </button>
        </>
      }
    >
      <Field label="Mục tiêu session (plain Vietnamese)" required>
        <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} style={{ minHeight: 80 }} />
      </Field>

      <FieldRow>
        <Field label="Model">
          <Select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            options={[
              { value: "opus", label: "Claude Opus 4.7 — Quality, $$$" },
              { value: "sonnet", label: "Claude Sonnet 4.6 — Balance" },
              { value: "haiku", label: "Claude Haiku 4.5 — Speed, cheap" },
            ]}
          />
        </Field>
        <Field label="Permission mode">
          <Select
            value={permMode}
            onChange={(e) => setPermMode(e.target.value as typeof permMode)}
            options={[
              { value: "acceptEdits", label: "acceptEdits (auto-approve file ops)" },
              { value: "plan", label: "plan (confirm trước mỗi action)" },
              { value: "bypass", label: "bypass (full auto — nguy hiểm)" },
            ]}
          />
        </Field>
      </FieldRow>

      <FieldRow>
        <Field label="Max output tokens">
          <Input type="number" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} />
        </Field>
        <Field label="Context window (tokens)">
          <Select
            value={contextBudget}
            onChange={(e) => setContextBudget(e.target.value)}
            options={[
              { value: "200000", label: "200k (standard)" },
              { value: "1000000", label: "1M context (long-run)" },
            ]}
          />
        </Field>
      </FieldRow>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>Tools được enable</div>
      <Checkbox label="Bash (run tests, build, lint)" defaultChecked />
      <Checkbox label="Edit (sửa file)" defaultChecked />
      <Checkbox label="Git commit + push" defaultChecked />
      <Checkbox label="Deploy staging" help="Agent tự deploy khi build pass" />
      <Checkbox label="Deploy production" help="NGUY HIỂM — khuyến nghị tắt" />
      <Checkbox label="Web fetch (search doc)" defaultChecked />

      <div
        style={{
          marginTop: 12,
          padding: 10,
          background: "rgba(20,184,166,0.05)",
          borderRadius: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
        }}
      >
        Ước tính: 15-20 phút · ~$2.40 · commit ~8 files
      </div>
    </Modal>
  );
}
