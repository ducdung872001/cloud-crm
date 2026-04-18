import { useState, useEffect } from "react";
import { Modal, Field, FieldRow, Input, Select, Textarea, Chips } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

export interface Requirement {
  id: string;
  code: string;
  title: string;
  priority: "must" | "should" | "could" | "wont";
  type: "functional" | "non-functional" | "integration" | "constraint";
  section: string;
  description: string;
  acceptance: string;
  source: string;
  tags: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  requirement?: Requirement | null;
  onSave: (r: Requirement) => void;
}

export default function RequirementFormModal({ open, onClose, requirement, onSave }: Props) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Requirement["priority"]>("must");
  const [type, setType] = useState<Requirement["type"]>("functional");
  const [section, setSection] = useState("§ 2.1");
  const [description, setDescription] = useState("");
  const [acceptance, setAcceptance] = useState("");
  const [source, setSource] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const { submitting, submit } = useFormStub(requirement ? "Đã cập nhật requirement" : "Đã thêm requirement");

  useEffect(() => {
    if (open) {
      setCode(requirement?.code ?? "FR-" + String(Math.floor(Math.random() * 900) + 100));
      setTitle(requirement?.title ?? "");
      setPriority(requirement?.priority ?? "must");
      setType(requirement?.type ?? "functional");
      setSection(requirement?.section ?? "§ 2.1");
      setDescription(requirement?.description ?? "");
      setAcceptance(requirement?.acceptance ?? "");
      setSource(requirement?.source ?? "");
      setTags(requirement?.tags ?? []);
    }
  }, [open, requirement]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={requirement ? `Sửa: ${requirement.code}` : "Thêm requirement"}
      kicker="STAGE 2 · FR"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={submitting || !title}
            onClick={() =>
              submit(() => {
                onSave({
                  id: requirement?.id ?? Date.now().toString(),
                  code,
                  title,
                  priority,
                  type,
                  section,
                  description,
                  acceptance,
                  source,
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
        <Field label="Code" required help="FR-xxx (functional), NFR-xxx (non-functional)">
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        </Field>
        <Field label="Section" help="URD section anchor">
          <Input value={section} onChange={(e) => setSection(e.target.value)} />
        </Field>
      </FieldRow>
      <Field label="Tiêu đề" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <FieldRow>
        <Field label="Type">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as Requirement["type"])}
            options={[
              { value: "functional", label: "Functional" },
              { value: "non-functional", label: "Non-functional" },
              { value: "integration", label: "Integration" },
              { value: "constraint", label: "Constraint" },
            ]}
          />
        </Field>
        <Field label="Priority (MoSCoW)">
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Requirement["priority"])}
            options={[
              { value: "must", label: "Must have" },
              { value: "should", label: "Should have" },
              { value: "could", label: "Could have" },
              { value: "wont", label: "Won't (this iteration)" },
            ]}
          />
        </Field>
      </FieldRow>
      <Field label="Mô tả">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="Acceptance criteria" help="Tiêu chí để QA test pass">
        <Textarea value={acceptance} onChange={(e) => setAcceptance(e.target.value)} placeholder="GIVEN ... WHEN ... THEN ..." />
      </Field>
      <FieldRow>
        <Field label="Nguồn (meeting/transcript/CR)">
          <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Review #2 @ 00:12:34" />
        </Field>
        <Field label="Tags">
          <Chips value={tags} onChange={setTags} />
        </Field>
      </FieldRow>
    </Modal>
  );
}
