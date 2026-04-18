import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Textarea, Chips } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import { MEMBERS } from "../../data/team";

interface Props {
  open: boolean;
  onClose: () => void;
  testCode?: string;
}

export default function BugReportModal({ open, onClose, testCode }: Props) {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("major");
  const [priority, setPriority] = useState("high");
  const [module, setModule] = useState("Screens");
  const [env, setEnv] = useState("staging");
  const [assignee, setAssignee] = useState(MEMBERS.find((m) => m.role === "Dev")?.id ?? "");
  const [browser, setBrowser] = useState("");
  const [repro, setRepro] = useState("");
  const [actual, setActual] = useState("");
  const [expected, setExpected] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const { submitting, submit } = useFormStub("Đã tạo bug report", "Đã push sang Jira");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Báo cáo bug"
      kicker={testCode ? `STAGE 6 · BUG từ ${testCode}` : "STAGE 6 · BUG"}
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || !title || !repro} onClick={() => submit(onClose)}>
            {submitting ? "Đang tạo..." : "Tạo bug + Jira ticket"}
          </button>
        </>
      }
    >
      <Field label="Tiêu đề bug" required help="Viết dạng: [Module] Hành vi sai + bối cảnh">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="[Screens] Không filter được theo thành phố HCM" autoFocus />
      </Field>

      <FieldRow>
        <Field label="Severity" required>
          <Select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            options={[
              { value: "blocker", label: "Blocker (crash, data loss)" },
              { value: "critical", label: "Critical (core function broken)" },
              { value: "major", label: "Major (feature không hoạt động đúng)" },
              { value: "minor", label: "Minor (UI quirk, workaround tồn tại)" },
              { value: "trivial", label: "Trivial (cosmetic)" },
            ]}
          />
        </Field>
        <Field label="Priority" required>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: "urgent", label: "Urgent — fix ngay" },
              { value: "high", label: "High — sprint này" },
              { value: "medium", label: "Medium — sprint tới" },
              { value: "low", label: "Low — backlog" },
            ]}
          />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Module">
          <Input value={module} onChange={(e) => setModule(e.target.value)} />
        </Field>
        <Field label="Environment">
          <Select
            value={env}
            onChange={(e) => setEnv(e.target.value)}
            options={[
              { value: "dev", label: "Dev" },
              { value: "staging", label: "Staging" },
              { value: "prod", label: "Production" },
              { value: "local", label: "Local" },
            ]}
          />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Assign">
          <Select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            options={MEMBERS.filter((m) => m.active).map((m) => ({
              value: m.id,
              label: `${m.name} (${m.role})`,
            }))}
          />
        </Field>
        <Field label="Browser / Device">
          <Input value={browser} onChange={(e) => setBrowser(e.target.value)} placeholder="Chrome 127 — MacBook Pro M3" />
        </Field>
      </FieldRow>

      <Field label="Các bước tái hiện" required help="Đánh số, càng chi tiết càng tốt">
        <Textarea
          value={repro}
          onChange={(e) => setRepro(e.target.value)}
          style={{ minHeight: 100 }}
          placeholder="1. Mở trang /screens
2. Chọn filter 'Thành phố: HCM'
3. Observe: ..."
        />
      </Field>
      <FieldRow>
        <Field label="Actual result" required>
          <Textarea value={actual} onChange={(e) => setActual(e.target.value)} />
        </Field>
        <Field label="Expected result" required>
          <Textarea value={expected} onChange={(e) => setExpected(e.target.value)} />
        </Field>
      </FieldRow>
      <Field label="Screenshot / video">
        <div className="upload-zone" style={{ padding: 14 }}>
          <div className="field-help">Kéo thả ảnh / video / .har file</div>
        </div>
      </Field>
      <Field label="Labels">
        <Chips value={labels} onChange={setLabels} placeholder="regression, ux, api..." />
      </Field>
    </Modal>
  );
}
