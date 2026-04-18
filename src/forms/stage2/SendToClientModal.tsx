import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { ChipsField, FieldRow, Modal, SelectField, TextField, TextareaField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = z.object({
  to: z.array(z.string().email(v.msg.email)).min(1, "Cần ít nhất 1 người nhận"),
  cc: z.array(z.string().email(v.msg.email)),
  template: z.string(),
  subject: v.requiredString("Subject bắt buộc").max(200, v.msg.max(200)),
  body: v.requiredString("Body bắt buộc").max(10_000, v.msg.max(10_000)),
  deadline: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export default function SendToClientModal({ open, onClose }: Props) {
  const { submitting, submit } = useFormStub("Đã gửi URD cho KH", "Link portal kèm signature request");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      to: ["minh.a@megamart.vn"],
      cc: ["lan.c@megamart.vn"],
      template: "urd-review",
      subject: "[MEGAMART-DOOH] URD v1.3 — Mời review",
      body: "Chào anh/chị,\n\nTeam Reborn đã sinh URD v1.3 dựa trên buổi họp ngày 18/04. Mời anh/chị review và feedback tại link đính kèm.\n\nDeadline: 22/04/2026\n\nTrân trọng,\nReborn Team",
      deadline: "",
    },
  });
  const onSubmit = form.handleSubmit(() => submit(onClose));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gửi URD cho khách hàng"
      kicker="STAGE 2 · SEND"
      sub="Email + tạo link portal review + signature request"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn">
            Preview email
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={onSubmit}>
            {submitting ? "Đang gửi..." : "Gửi → KH"}
          </button>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <FieldRow>
            <ChipsField<Values> name="to" label="To" required />
            <ChipsField<Values> name="cc" label="Cc" />
          </FieldRow>
          <FieldRow>
            <SelectField<Values>
              name="template"
              label="Template"
              options={[
                { value: "urd-review", label: "Gửi URD review" },
                { value: "urd-final", label: "Gửi URD chính thức (ký)" },
                { value: "custom", label: "Tùy chỉnh" },
              ]}
            />
            <TextField<Values> name="deadline" label="Deadline review" type="date" />
          </FieldRow>
          <TextField<Values> name="subject" label="Subject" required />
          <TextareaField<Values> name="body" label="Body" style={{ minHeight: 160 }} />
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: 10,
              background: "var(--slate-50)",
              borderRadius: 8,
              fontSize: 12,
            }}
          >
            <span className="tag tag-info">📎 URD-v1.3.pdf</span>
            <span className="tag tag-info">🔗 Portal link</span>
            <span className="tag tag-warn">✒ Signature request</span>
          </div>
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
