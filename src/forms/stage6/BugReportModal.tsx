import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { ChipsField, FieldRow, Modal, SelectField, TextField, TextareaField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import { MEMBERS } from "../../data/team";

interface Props {
  open: boolean;
  onClose: () => void;
  testCode?: string;
}

const schema = z.object({
  title: v.requiredString("Tiêu đề bug bắt buộc").max(200, v.msg.max(200)),
  severity: z.enum(["blocker", "critical", "major", "minor", "trivial"]),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  module: v.requiredString("Module bắt buộc").max(80, v.msg.max(80)),
  env: z.enum(["dev", "staging", "prod", "local"]),
  assignee: v.requiredString("Cần assign cho ai đó"),
  browser: z.string().max(200, v.msg.max(200)),
  repro: v.requiredString("Bước tái hiện bắt buộc").max(3000, v.msg.max(3000)),
  actual: v.requiredString("Kết quả thực tế bắt buộc").max(1000, v.msg.max(1000)),
  expected: v.requiredString("Kết quả mong đợi bắt buộc").max(1000, v.msg.max(1000)),
  labels: z.array(z.string()),
});
type Values = z.infer<typeof schema>;

export default function BugReportModal({ open, onClose, testCode }: Props) {
  const { submitting, submit } = useFormStub("Đã tạo bug report", "Đã push sang Jira");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      title: "",
      severity: "major",
      priority: "high",
      module: "Screens",
      env: "staging",
      assignee: MEMBERS.find((m) => m.role === "Dev")?.id ?? MEMBERS[0].id,
      browser: "",
      repro: "",
      actual: "",
      expected: "",
      labels: [],
    },
  });

  const onSubmit = form.handleSubmit(() =>
    submit(() => {
      form.reset();
      onClose();
    })
  );

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
          <button type="button" className="btn primary" disabled={submitting} onClick={onSubmit}>
            {submitting ? "Đang tạo..." : "Tạo bug + Jira ticket"}
          </button>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <TextField<Values>
            name="title"
            label="Tiêu đề bug"
            required
            help="Viết dạng: [Module] Hành vi sai + bối cảnh"
            placeholder="[Screens] Không filter được theo thành phố HCM"
            autoFocus
          />
          <FieldRow>
            <SelectField<Values>
              name="severity"
              label="Severity"
              required
              options={[
                { value: "blocker", label: "Blocker (crash, data loss)" },
                { value: "critical", label: "Critical (core function broken)" },
                { value: "major", label: "Major (feature không đúng)" },
                { value: "minor", label: "Minor (UI quirk)" },
                { value: "trivial", label: "Trivial (cosmetic)" },
              ]}
            />
            <SelectField<Values>
              name="priority"
              label="Priority"
              required
              options={[
                { value: "urgent", label: "Urgent — fix ngay" },
                { value: "high", label: "High — sprint này" },
                { value: "medium", label: "Medium — sprint tới" },
                { value: "low", label: "Low — backlog" },
              ]}
            />
          </FieldRow>
          <FieldRow>
            <TextField<Values> name="module" label="Module" />
            <SelectField<Values>
              name="env"
              label="Environment"
              options={[
                { value: "dev", label: "Dev" },
                { value: "staging", label: "Staging" },
                { value: "prod", label: "Production" },
                { value: "local", label: "Local" },
              ]}
            />
          </FieldRow>
          <FieldRow>
            <SelectField<Values>
              name="assignee"
              label="Assign"
              required
              options={MEMBERS.filter((m) => m.active).map((m) => ({
                value: m.id,
                label: `${m.name} (${m.role})`,
              }))}
            />
            <TextField<Values> name="browser" label="Browser / Device" placeholder="Chrome 127 — MacBook Pro M3" />
          </FieldRow>
          <TextareaField<Values>
            name="repro"
            label="Các bước tái hiện"
            required
            help="Đánh số, càng chi tiết càng tốt"
            style={{ minHeight: 100 }}
            placeholder={`1. Mở trang /screens\n2. Chọn filter 'Thành phố: HCM'\n3. Observe: ...`}
          />
          <FieldRow>
            <TextareaField<Values> name="actual" label="Actual result" required />
            <TextareaField<Values> name="expected" label="Expected result" required />
          </FieldRow>
          <ChipsField<Values> name="labels" label="Labels" placeholder="regression, ux..." />
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
