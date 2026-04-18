import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { FieldRow, SelectField, TextField, ToggleField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

const schema = z.object({
  monthlyCap: v.positiveNumber(10_000_000),
  projectCap: v.positiveNumber(1_000_000),
  currency: z.string(),
  alert80: z.boolean(),
  alert95: z.boolean(),
  hardStop: z.boolean(),
  alertEmail: z
    .string()
    .trim()
    .min(1, v.msg.required)
    .refine(
      (val) =>
        val
          .split(",")
          .map((e) => e.trim())
          .every((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)),
      "Danh sách email không hợp lệ (phân cách dấu phẩy)"
    ),
});
type Values = z.infer<typeof schema>;

export default function BudgetSettings() {
  const { submitting, submit } = useFormStub("Đã lưu budget cap");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      monthlyCap: 5000,
      projectCap: 500,
      currency: "USD",
      alert80: true,
      alert95: true,
      hardStop: false,
      alertEmail: "ceo@reborn.vn,finance@reborn.vn",
    },
  });
  const onSubmit = form.handleSubmit(() => submit());

  return (
    <div>
      <div className="settings-section-title">AI Budget & Alerts</div>
      <div className="settings-section-sub">Giới hạn chi phí AI tránh vượt quota. Áp dụng cho toàn bộ tenant (override tại project).</div>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <FieldRow>
            <TextField<Values> name="monthlyCap" label="Trần chi phí tháng (USD)" required type="number" />
            <TextField<Values> name="projectCap" label="Trần mặc định mỗi project (USD)" type="number" />
          </FieldRow>
          <SelectField<Values>
            name="currency"
            label="Currency"
            options={[
              { value: "USD", label: "USD" },
              { value: "VND", label: "VND (convert theo rate hàng ngày)" },
            ]}
          />

          <div
            style={{
              padding: 14,
              background: "var(--slate-50)",
              borderRadius: 10,
              marginTop: 14,
              marginBottom: 14,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Cảnh báo</div>
            <ToggleField<Values> name="alert80" labelText="Cảnh báo khi đạt 80% cap" help="Gửi email cho danh sách bên dưới" />
            <ToggleField<Values> name="alert95" labelText="Cảnh báo khi đạt 95% cap" />
            <ToggleField<Values> name="hardStop" labelText="Hard stop khi vượt cap" help="Agent sẽ bị pause cho đến khi tăng cap hoặc sang tháng" />
          </div>

          <TextField<Values> name="alertEmail" label="Email nhận cảnh báo" help="Phân cách bằng dấu phẩy" />

          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </form>
      </FormProvider>
    </div>
  );
}
