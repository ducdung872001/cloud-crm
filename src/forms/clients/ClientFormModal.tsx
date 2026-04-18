import { useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { FieldRow, Modal, SelectField, TextField, TextareaField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import type { Client } from "../../data/clients";

interface Props {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
  onSave: (data: Partial<Client>) => void;
}

const schema = z.object({
  name: v.requiredString("Tên công ty bắt buộc").max(120, v.msg.max(120)),
  code: z
    .string()
    .trim()
    .min(2, v.msg.min(2))
    .max(20, v.msg.max(20))
    .regex(/^[A-Z0-9-]+$/, v.msg.upperCode),
  taxId: v.taxIdSchema,
  industry: z.string(),
  address: z.string().max(255, v.msg.max(255)),
  website: v.urlSchema,
});
type Values = z.infer<typeof schema>;

const INDUSTRY_OPTIONS = [
  { value: "Retail", label: "Retail / E-commerce" },
  { value: "Banking", label: "Banking / Finance" },
  { value: "Insurance", label: "Insurance" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Telco", label: "Telecom" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Education", label: "Education" },
  { value: "Government", label: "Government" },
  { value: "Other", label: "Khác" },
];

export default function ClientFormModal({ open, onClose, client, onSave }: Props) {
  const { submitting, submit } = useFormStub(client ? "Đã cập nhật khách hàng" : "Đã thêm khách hàng");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      name: "",
      code: "",
      taxId: "",
      industry: "Other",
      address: "",
      website: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: client?.name ?? "",
        code: client?.code ?? "",
        taxId: client?.taxId ?? "",
        industry: client?.industry ?? "Other",
        address: client?.address ?? "",
        website: client?.website ?? "",
      });
    }
  }, [open, client, form]);

  const onSubmit = form.handleSubmit((data) =>
    submit(() => {
      onSave(data);
      onClose();
    })
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client ? `Sửa: ${client.name}` : "Thêm khách hàng mới"}
      kicker="CLIENT"
      sub="Thông tin hiển thị trên URD, hợp đồng, hóa đơn."
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
            <TextField<Values> name="name" label="Tên công ty" required />
            <TextField<Values>
              name="code"
              label="Mã khách hàng"
              required
              help="Viết hoa, dùng làm prefix project code"
              style={{ textTransform: "uppercase" }}
            />
          </FieldRow>
          <FieldRow>
            <TextField<Values> name="taxId" label="Mã số thuế" />
            <SelectField<Values> name="industry" label="Industry" options={INDUSTRY_OPTIONS} />
          </FieldRow>
          <TextField<Values> name="website" label="Website" type="url" placeholder="https://..." />
          <TextareaField<Values> name="address" label="Địa chỉ" style={{ minHeight: 60 }} />
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
