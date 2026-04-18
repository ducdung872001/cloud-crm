import { useState, useEffect } from "react";
import { Modal, Field, FieldRow, Input, Select, Textarea, Chips } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  model: string;
  description: string;
  system: string;
  user: string;
  tags: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  template?: PromptTemplate | null;
  onSave: (t: PromptTemplate) => void;
}

const CATEGORIES = [
  { value: "session-kickoff", label: "Session — Kickoff" },
  { value: "session-review", label: "Session — Review" },
  { value: "session-change", label: "Session — Change Request" },
  { value: "session-uat", label: "Session — UAT" },
  { value: "session-internal", label: "Session — Internal Sync" },
  { value: "stage-urd", label: "Stage 2 — URD generation" },
  { value: "stage-proto", label: "Stage 3 — Prototype" },
  { value: "stage-fe", label: "Stage 4 — Frontend scaffold" },
  { value: "stage-be", label: "Stage 5 — Backend scaffold" },
  { value: "stage-qa", label: "Stage 6 — Test case generation" },
  { value: "stage-handover", label: "Stage 7 — Release doc" },
  { value: "utility", label: "Utility (summarize, extract...)" },
];

export default function PromptTemplateModal({ open, onClose, template, onSave }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("session-review");
  const [model, setModel] = useState("opus");
  const [description, setDescription] = useState("");
  const [system, setSystem] = useState("");
  const [user, setUser] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const { submitting, submit } = useFormStub(template ? "Đã cập nhật template" : "Đã tạo template");

  useEffect(() => {
    if (open) {
      setName(template?.name ?? "");
      setCategory(template?.category ?? "session-review");
      setModel(template?.model ?? "opus");
      setDescription(template?.description ?? "");
      setSystem(template?.system ?? "");
      setUser(template?.user ?? "");
      setTags(template?.tags ?? []);
    }
  }, [open, template]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={template ? `Sửa: ${template.name}` : "Tạo prompt template"}
      kicker="PROMPT · TEMPLATE"
      size="xwide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn">
            Test prompt →
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={submitting || !name || !user}
            onClick={() =>
              submit(() => {
                onSave({
                  id: template?.id ?? Date.now().toString(),
                  name,
                  category,
                  model,
                  description,
                  system,
                  user,
                  tags,
                });
                onClose();
              })
            }
          >
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </>
      }
    >
      <FieldRow>
        <Field label="Tên template" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Category" required>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Default model">
          <Select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            options={[
              { value: "opus", label: "Claude Opus 4.7" },
              { value: "sonnet", label: "Claude Sonnet 4.6" },
              { value: "haiku", label: "Claude Haiku 4.5" },
            ]}
          />
        </Field>
        <Field label="Tags">
          <Chips value={tags} onChange={setTags} placeholder="urd, vietnamese, strict..." />
        </Field>
      </FieldRow>
      <Field label="Mô tả ngắn (khi nào dùng)">
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="System prompt">
        <Textarea
          className="mono"
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          style={{ minHeight: 120 }}
          placeholder="You are an expert BA assistant. Output strict JSON..."
        />
      </Field>
      <Field label="User prompt template" required help="Dùng {{variable}} cho template variables">
        <Textarea
          className="mono"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          style={{ minHeight: 160 }}
          placeholder={`Given this meeting transcript:\n{{transcript}}\n\nAnd current URD:\n{{urd_current}}\n\nOutput the diff in {{output_format}}.`}
        />
      </Field>
    </Modal>
  );
}
