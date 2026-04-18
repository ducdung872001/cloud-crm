import { useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { ChipsField, FieldRow, Modal, SelectField, TextField, TextareaField, useZodForm, v } from "../../components/ui";
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

const schema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^TC-\d{2,5}$/, "Định dạng: TC-xxx"),
  title: v.requiredString("Tiêu đề bắt buộc").max(200, v.msg.max(200)),
  module: v.requiredString("Module bắt buộc").max(80, v.msg.max(80)),
  priority: z.enum(["high", "medium", "low"]),
  type: z.enum(["positive", "negative", "edge", "smoke", "e2e"]),
  preconditions: z.string().max(1000, v.msg.max(1000)),
  steps: v.requiredString("Các bước bắt buộc").max(3000, v.msg.max(3000)),
  expected: v.requiredString("Expected result bắt buộc").max(1000, v.msg.max(1000)),
  linkedFr: z.array(z.string()),
});
type Values = z.infer<typeof schema>;

export default function TestCaseFormModal({ open, onClose, tc, onSave }: Props) {
  const { submitting, submit } = useFormStub(tc ? "Đã cập nhật test case" : "Đã thêm test case");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      code: "TC-101",
      title: "",
      module: "Screens",
      priority: "medium",
      type: "positive",
      preconditions: "",
      steps: "",
      expected: "",
      linkedFr: [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        code: tc?.code ?? "TC-" + String(Math.floor(Math.random() * 900) + 100),
        title: tc?.title ?? "",
        module: tc?.module ?? "Screens",
        priority: tc?.priority ?? "medium",
        type: tc?.type ?? "positive",
        preconditions: tc?.preconditions ?? "",
        steps: tc?.steps ?? "",
        expected: tc?.expected ?? "",
        linkedFr: tc?.linkedFr ?? [],
      });
    }
  }, [open, tc, form]);

  const onSubmit = form.handleSubmit((data) =>
    submit(() => {
      onSave({
        id: tc?.id ?? Date.now().toString(),
        ...data,
        autoable: data.type !== "e2e",
      });
      onClose();
    })
  );

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
          <button type="button" className="btn primary" disabled={submitting} onClick={onSubmit}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <FieldRow>
            <TextField<Values> name="code" label="Code" required style={{ textTransform: "uppercase" }} />
            <TextField<Values> name="module" label="Module" required />
          </FieldRow>
          <TextField<Values> name="title" label="Tiêu đề" required />
          <FieldRow>
            <SelectField<Values>
              name="type"
              label="Type"
              options={[
                { value: "positive", label: "Positive (happy path)" },
                { value: "negative", label: "Negative (error case)" },
                { value: "edge", label: "Edge case" },
                { value: "smoke", label: "Smoke" },
                { value: "e2e", label: "End-to-end" },
              ]}
            />
            <SelectField<Values>
              name="priority"
              label="Priority"
              options={[
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
            />
          </FieldRow>
          <TextareaField<Values> name="preconditions" label="Preconditions" />
          <TextareaField<Values>
            name="steps"
            label="Steps"
            required
            help="Mỗi bước 1 dòng, đánh số 1. 2. 3."
            style={{ minHeight: 120 }}
            placeholder={`1. Mở trang /screens\n2. Click nút 'Thêm mới'\n3. Điền form\n4. Click 'Lưu'`}
          />
          <TextareaField<Values>
            name="expected"
            label="Expected result"
            required
            placeholder="Record mới xuất hiện trong list, có ID auto-generated, status = 'draft'"
          />
          <ChipsField<Values> name="linkedFr" label="Linked requirements (FR)" help="Enter để thêm" placeholder="FR-001, FR-002..." />
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
