import { useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { CheckboxField, FieldRow, Modal, TextField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import type { ClientContact } from "../../data/clients";

interface Props {
  open: boolean;
  onClose: () => void;
  contact?: ClientContact | null;
  onSave: (data: ClientContact) => void;
}

const schema = z.object({
  name: v.requiredString("Họ tên bắt buộc").max(80, v.msg.max(80)),
  title: z.string().max(120, v.msg.max(120)),
  email: v.emailSchema,
  phone: v.phoneSchema,
  primary: z.boolean(),
});
type Values = z.infer<typeof schema>;

export default function ContactFormModal({ open, onClose, contact, onSave }: Props) {
  const { submitting, submit } = useFormStub("Đã lưu contact");
  const form = useZodForm<Values>({
    schema,
    defaultValues: { name: "", title: "", email: "", phone: "", primary: false },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: contact?.name ?? "",
        title: contact?.title ?? "",
        email: contact?.email ?? "",
        phone: contact?.phone ?? "",
        primary: contact?.primary ?? false,
      });
    }
  }, [open, contact, form]);

  const onSubmit = form.handleSubmit((data) =>
    submit(() => {
      onSave({
        id: contact?.id ?? Date.now().toString(),
        name: data.name,
        title: data.title,
        email: data.email,
        phone: data.phone ?? "",
        primary: data.primary,
      });
      onClose();
    })
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={contact ? "Sửa contact" : "Thêm contact"}
      kicker="CLIENT · CONTACT"
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
            <TextField<Values> name="name" label="Họ tên" required />
            <TextField<Values> name="title" label="Chức danh" />
          </FieldRow>
          <FieldRow>
            <TextField<Values> name="email" label="Email" required type="email" />
            <TextField<Values> name="phone" label="Điện thoại" />
          </FieldRow>
          <CheckboxField<Values> name="primary" labelText="Đặt làm liên hệ chính" help="Email URD, UAT sẽ gửi trực tiếp cho contact này" />
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
