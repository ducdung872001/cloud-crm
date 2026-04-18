import { useState, useEffect } from "react";
import { Modal, Field, FieldRow, Input, Select, Textarea, Chips } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

export interface TestCase {
  id: string;
  code: string;
  title: string;
  module: string;
  priority: "high" | "medium" | "low";
  type: "positive" | "negative" | "edge" | "smoke" | "e2e";
  preconditions: string;
  steps: string;
  expected: string;
  linkedFr: string[];
  autoable: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  tc?: TestCase | null;
  onSave: (tc: TestCase) => void;
}

export default function TestCaseFormModal({ open, onClose, tc, onSave }: Props) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [module, setModule] = useState("Screens");
  const [priority, setPriority] = useState<TestCase["priority"]>("medium");
  const [type, setType] = useState<TestCase["type"]>("positive");
  const [preconditions, setPre] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [linkedFr, setLinkedFr] = useState<string[]>([]);
  const { submitting, submit } = useFormStub(tc ? "Đã cập nhật test case" : "Đã thêm test case");

  useEffect(() => {
    if (open) {
      setCode(tc?.code ?? "TC-" + String(Math.floor(Math.random() * 900) + 100));
      setTitle(tc?.title ?? "");
      setModule(tc?.module ?? "Screens");
      setPriority(tc?.priority ?? "medium");
      setType(tc?.type ?? "positive");
      setPre(tc?.preconditions ?? "");
      setSteps(tc?.steps ?? "");
      setExpected(tc?.expected ?? "");
      setLinkedFr(tc?.linkedFr ?? []);
    }
  }, [open, tc]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tc ? `Sửa: ${tc.code}` : "Thêm test case"}
      kicker="STAGE 6 · TEST CASE"
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
                  id: tc?.id ?? Date.now().toString(),
                  code,
                  title,
                  module,
                  priority,
                  type,
                  preconditions,
                  steps,
                  expected,
                  linkedFr,
                  autoable: type !== "e2e" || true,
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
        <Field label="Code" required>
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        </Field>
        <Field label="Module">
          <Input value={module} onChange={(e) => setModule(e.target.value)} />
        </Field>
      </FieldRow>
      <Field label="Tiêu đề" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <FieldRow>
        <Field label="Type">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as TestCase["type"])}
            options={[
              { value: "positive", label: "Positive (happy path)" },
              { value: "negative", label: "Negative (error case)" },
              { value: "edge", label: "Edge case" },
              { value: "smoke", label: "Smoke" },
              { value: "e2e", label: "End-to-end" },
            ]}
          />
        </Field>
        <Field label="Priority">
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TestCase["priority"])}
            options={[
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
          />
        </Field>
      </FieldRow>
      <Field label="Preconditions">
        <Textarea value={preconditions} onChange={(e) => setPre(e.target.value)} />
      </Field>
      <Field label="Steps" required help="Mỗi bước 1 dòng, đánh số 1. 2. 3.">
        <Textarea
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          style={{ minHeight: 120 }}
          placeholder="1. Mở trang /screens
2. Click nút 'Thêm mới'
3. Điền form với data hợp lệ
4. Click 'Lưu'"
        />
      </Field>
      <Field label="Expected result" required>
        <Textarea
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          placeholder="Record mới xuất hiện trong list, có ID auto-generated, status = 'draft'"
        />
      </Field>
      <Field label="Linked requirements (FR)" help="Enter để thêm">
        <Chips value={linkedFr} onChange={setLinkedFr} placeholder="FR-001, FR-002..." />
      </Field>
    </Modal>
  );
}
