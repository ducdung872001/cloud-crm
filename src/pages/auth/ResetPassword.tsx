import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { TextField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

const schema = z
  .object({
    password: v.passwordSchema,
    confirm: z.string(),
  })
  .superRefine(v.requireMatch("password", "confirm", "Mật khẩu nhập lại không khớp"));

type Values = z.infer<typeof schema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const { submitting, submit } = useFormStub("Mật khẩu đã đổi", "Đăng nhập với mật khẩu mới");

  const form = useZodForm<Values>({
    schema,
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = form.handleSubmit(() => submit(() => navigate("/login")));

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        <div className="auth-title">Đặt mật khẩu mới</div>
        <div className="auth-sub">Tối thiểu 8 ký tự, gồm chữ + số.</div>

        <TextField<Values> name="password" label="Mật khẩu mới" required type="password" autoFocus />
        <TextField<Values> name="confirm" label="Nhập lại mật khẩu" required type="password" />

        <button type="submit" className="btn primary" style={{ width: "100%", justifyContent: "center", marginTop: 6 }} disabled={submitting}>
          {submitting ? "Đang cập nhật..." : "Cập nhật mật khẩu →"}
        </button>
      </form>
    </FormProvider>
  );
}
