import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { CheckboxField, TextField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

const schema = z.object({
  email: v.emailSchema,
  password: z.string().min(1, v.msg.required),
  remember: z.boolean(),
});
type LoginValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { submitting, submit } = useFormStub("Đăng nhập thành công", "Chuyển về Projects Hub");

  const form = useZodForm<LoginValues>({
    schema,
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = form.handleSubmit(() => submit(() => navigate("/hub")));

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        <div className="auth-title">Đăng nhập</div>
        <div className="auth-sub">Dùng tài khoản Reborn hoặc SSO công ty.</div>

        <button type="button" className="btn" style={{ width: "100%", justifyContent: "center" }}>
          <span>🇬</span> Tiếp tục với Google
        </button>
        <button type="button" className="btn" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
          <span>Ⓜ</span> Tiếp tục với Microsoft
        </button>

        <div className="auth-divider">hoặc email</div>

        <TextField<LoginValues> name="email" label="Email" required type="email" placeholder="ban@reborn.vn" autoFocus />
        <TextField<LoginValues>
          name="password"
          label={
            <span style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              Mật khẩu <span className="field-required">*</span>
              <a
                style={{
                  color: "var(--teal-500)",
                  cursor: "pointer",
                  fontWeight: 500,
                  marginLeft: "auto",
                }}
                onClick={() => navigate("/forgot-password")}
              >
                Quên?
              </a>
            </span>
          }
          type="password"
          placeholder="••••••••"
        />
        <CheckboxField<LoginValues> name="remember" labelText="Ghi nhớ thiết bị 30 ngày" />

        <button type="submit" className="btn primary" style={{ width: "100%", justifyContent: "center", marginTop: 14 }} disabled={submitting}>
          {submitting ? "Đang đăng nhập..." : "Đăng nhập →"}
        </button>

        <div className="auth-foot">
          Chưa có tài khoản? <a onClick={() => navigate("/signup")}>Liên hệ Admin</a>
        </div>
      </form>
    </FormProvider>
  );
}
