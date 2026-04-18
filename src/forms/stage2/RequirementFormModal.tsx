import { useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { ChipsField, FieldRow, Modal, SelectField, TextField, TextareaField, useZodForm, v } from "../../components/ui";
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

const schema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^(FR|NFR|INT|CON)-\d{2,5}$/, "Định dạng: FR-xxx / NFR-xxx / INT-xxx / CON-xxx"),
  title: v.requiredString("Tiêu đề bắt buộc").max(200, v.msg.max(200)),
  priority: z.enum(["must", "should", "could", "wont"]),
  type: z.enum(["functional", "non-functional", "integration", "constraint"]),
  section: z.string().trim().min(1, v.msg.required),
  description: z.string().max(2000, v.msg.max(2000)),
  acceptance: z.string().max(2000, v.msg.max(2000)),
  source: z.string().max(200, v.msg.max(200)),
  tags: z.array(z.string()),
});
type Values = z.infer<typeof schema>;

export default function RequirementFormModal({ open, onClose, requirement, onSave }: Props) {
  const { submitting, submit } = useFormStub(requirement ? "Đã cập nhật requirement" : "Đã thêm requirement");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      code: "FR-101",
      title: "",
      priority: "must",
      type: "functional",
      section: "§ 2.1",
      description: "",
      acceptance: "",
      source: "",
      tags: [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        code: requirement?.code ?? "FR-" + String(Math.floor(Math.random() * 900) + 100),
        title: requirement?.title ?? "",
        priority: requirement?.priority ?? "must",
        type: requirement?.type ?? "functional",
        section: requirement?.section ?? "§ 2.1",
        description: requirement?.description ?? "",
        acceptance: requirement?.acceptance ?? "",
        source: requirement?.source ?? "",
        tags: requirement?.tags ?? [],
      });
    }
  }, [open, requirement, form]);

  const onSubmit = form.handleSubmit((data) =>
    submit(() => {
      onSave({ id: requirement?.id ?? Date.now().toString(), ...data });
      onClose();
    })
  );

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
          <button type="button" className="btn primary" disabled={submitting} onClick={onSubmit}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <FieldRow>
            <TextField<Values> name="code" label="Code" required help="FR-xxx / NFR-xxx" style={{ textTransform: "uppercase" }} />
            <TextField<Values> name="section" label="Section" help="URD section anchor" />
          </FieldRow>
          <TextField<Values> name="title" label="Tiêu đề" required />
          <FieldRow>
            <SelectField<Values>
              name="type"
              label="Type"
              options={[
                { value: "functional", label: "Functional" },
                { value: "non-functional", label: "Non-functional" },
                { value: "integration", label: "Integration" },
                { value: "constraint", label: "Constraint" },
              ]}
            />
            <SelectField<Values>
              name="priority"
              label="Priority (MoSCoW)"
              options={[
                { value: "must", label: "Must have" },
                { value: "should", label: "Should have" },
                { value: "could", label: "Could have" },
                { value: "wont", label: "Won't (this iteration)" },
              ]}
            />
          </FieldRow>
          <TextareaField<Values> name="description" label="Mô tả" />
          <TextareaField<Values>
            name="acceptance"
            label="Acceptance criteria"
            help="Tiêu chí để QA test pass"
            placeholder="GIVEN ... WHEN ... THEN ..."
          />
          <FieldRow>
            <TextField<Values> name="source" label="Nguồn (meeting/transcript/CR)" placeholder="Review #2 @ 00:12:34" />
            <ChipsField<Values> name="tags" label="Tags" />
          </FieldRow>
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
