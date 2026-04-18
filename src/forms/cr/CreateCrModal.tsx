import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { CheckboxField, FieldRow, Modal, SelectField, TextField, TextareaField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = z
  .object({
    title: v.requiredString("Tiêu đề CR bắt buộc").max(200, v.msg.max(200)),
    source: z.string(),
    sourceRef: z.string().max(200, v.msg.max(200)),
    description: v.requiredString("Mô tả bắt buộc").max(3000, v.msg.max(3000)),
    impactType: z.enum(["minor", "major", "breaking"]),
    stages: z.array(z.string()).min(1, "Chọn ít nhất 1 stage bị ảnh hưởng"),
    timelineDays: z.coerce.number().int().min(-365).max(365).optional(),
    costUsd: z.coerce.number().min(-1_000_000).max(1_000_000).optional(),
    autoAnalyze: z.boolean(),
  })
  .superRefine((d, ctx) => {
    if (!d.autoAnalyze && (d.timelineDays === undefined || Number.isNaN(d.timelineDays))) {
      ctx.addIssue({ code: "custom", path: ["timelineDays"], message: "Bắt buộc khi không auto-analyze" });
    }
    if (!d.autoAnalyze && (d.costUsd === undefined || Number.isNaN(d.costUsd))) {
      ctx.addIssue({ code: "custom", path: ["costUsd"], message: "Bắt buộc khi không auto-analyze" });
    }
  });

type Values = z.infer<typeof schema>;

const STAGE_CHOICES = ["URD", "Prototype", "FE", "BE", "QA", "Docs"];

export default function CreateCrModal({ open, onClose }: Props) {
  const { submitting, submit } = useFormStub("Đã tạo Change Request", "Gửi thông báo PM + Tech Lead để đánh giá");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      title: "",
      source: "meeting",
      sourceRef: "",
      description: "",
      impactType: "minor",
      stages: [],
      timelineDays: undefined,
      costUsd: undefined,
      autoAnalyze: true,
    },
  });

  const stages = form.watch("stages");
  const autoAnalyze = form.watch("autoAnalyze");

  const toggleStage = (s: string) => {
    form.setValue("stages", stages.includes(s) ? stages.filter((x) => x !== s) : [...stages, s], { shouldValidate: true });
  };

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
      title="Tạo Change Request mới"
      kicker="CR · NEW"
      sub="Bất kỳ thay đổi scope sau khi URD đã chốt đều phải đi qua CR workflow"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={onSubmit}>
            {submitting ? "Đang tạo..." : "Tạo CR"}
          </button>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <TextField<Values> name="title" label="Tiêu đề CR" required placeholder="Thêm multi-language support" autoFocus />
          <FieldRow>
            <SelectField<Values>
              name="source"
              label="Nguồn yêu cầu"
              options={[
                { value: "meeting", label: "Từ meeting session" },
                { value: "email", label: "Email KH" },
                { value: "call", label: "Gọi điện" },
                { value: "internal", label: "Nội bộ đề xuất" },
                { value: "compliance", label: "Compliance / legal" },
              ]}
            />
            <TextField<Values> name="sourceRef" label="Reference" placeholder="Session #3 @ 00:24:08" />
          </FieldRow>
          <TextareaField<Values> name="description" label="Mô tả chi tiết" required style={{ minHeight: 100 }} />

          <div style={{ fontWeight: 600, fontSize: 13, margin: "14px 0 6px" }}>
            Impact analysis {autoAnalyze ? <span className="tag tag-ai">AI tự tính</span> : null}
          </div>
          <CheckboxField<Values> name="autoAnalyze" labelText="AI tự phân tích impact từ URD + repo hiện tại" />
          <FieldRow>
            <SelectField<Values>
              name="impactType"
              label="Type"
              options={[
                { value: "minor", label: "MINOR (1-3 ngày)" },
                { value: "major", label: "MAJOR (> 5 ngày)" },
                { value: "breaking", label: "BREAKING (thay contract API)" },
              ]}
            />
            <TextField<Values>
              name="timelineDays"
              label="Timeline (+ ngày)"
              type="number"
              disabled={autoAnalyze}
              placeholder={autoAnalyze ? "AI tính..." : "15"}
            />
          </FieldRow>
          <TextField<Values>
            name="costUsd"
            label="Ước tính cost (USD)"
            type="number"
            disabled={autoAnalyze}
            placeholder={autoAnalyze ? "AI tính..." : "2400"}
          />

          <div className="field">
            <div className="field-label">
              Stages bị ảnh hưởng <span className="field-required">*</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STAGE_CHOICES.map((s) => (
                <button key={s} type="button" className={`filter-chip ${stages.includes(s) ? "active" : ""}`} onClick={() => toggleStage(s)}>
                  {s}
                </button>
              ))}
            </div>
            {form.formState.errors.stages ? <div className="field-error">{form.formState.errors.stages.message as string}</div> : null}
          </div>

          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
