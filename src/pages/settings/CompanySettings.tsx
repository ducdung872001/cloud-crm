import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { FieldRow, SelectField, TextField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

const schema = z.object({
  name: v.requiredString("Tên công ty bắt buộc").max(120, v.msg.max(120)),
  taxId: v.taxIdSchema,
  address: z.string().max(255, v.msg.max(255)),
  currency: z.string(),
  fiscalYear: z.string().regex(/^\d{2}-\d{2}$/, "Định dạng MM-DD"),
});
type Values = z.infer<typeof schema>;

export default function CompanySettings() {
  const { submitting, submit } = useFormStub("Đã lưu thông tin công ty");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      name: "Reborn JSC",
      taxId: "0106-3-xxxxxx",
      address: "Tầng 5, Tòa nhà XYZ, Cầu Giấy, Hà Nội",
      currency: "VND",
      fiscalYear: "01-01",
    },
  });
  const onSubmit = form.handleSubmit(() => submit());

  return (
    <div>
      <div className="settings-section-title">Thông tin công ty</div>
      <div className="settings-section-sub">Hiển thị trên URD, release note, báo cáo gửi KH.</div>

      <div
        style={{
          padding: 18,
          border: "1px solid var(--slate-200)",
          borderRadius: 10,
          marginBottom: 18,
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            background: "linear-gradient(135deg, var(--teal-400), var(--teal-500))",
            color: "var(--navy-900)",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 28,
            display: "grid",
            placeItems: "center",
          }}
        >
          R
        </div>
        <div>
          <button type="button" className="btn sm">
            ↑ Upload logo
          </button>
          <div className="field-help" style={{ marginTop: 4 }}>
            SVG hoặc PNG 512×512, nền trong suốt
          </div>
        </div>
      </div>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <TextField<Values> name="name" label="Tên công ty" required />
          <FieldRow>
            <TextField<Values> name="taxId" label="Mã số thuế" />
            <SelectField<Values>
              name="currency"
              label="Currency mặc định"
              options={[
                { value: "VND", label: "₫ VND" },
                { value: "USD", label: "$ USD" },
                { value: "EUR", label: "€ EUR" },
              ]}
            />
          </FieldRow>
          <TextField<Values> name="address" label="Địa chỉ" />
          <TextField<Values> name="fiscalYear" label="Đầu năm tài chính (MM-DD)" />

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
