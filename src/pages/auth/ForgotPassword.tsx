import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { TextField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

const schema = z.object({ email: v.emailSchema });
type Values = z.infer<typeof schema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [sent, setSent] = useState<string | null>(null);
  const { submitting, submit } = useFormStub("Email reset đã gửi", "Kiểm tra hộp thư trong 5 phút");

  const form = useZodForm<Values>({ schema, defaultValues: { email: "" } });
  const onSubmit = form.handleSubmit((data) => submit(() => setSent(data.email)));

  if (sent) {
    return (
      <div>
        <div className="auth-title">Đã gửi email</div>
        <div className="auth-sub">
          Hướng dẫn đặt lại mật khẩu đã gửi đến <strong>{sent}</strong>. Link có hiệu lực 15 phút.
        </div>
        <button type="button" className="btn primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate("/login")}>
          ← Quay lại đăng nhập
        </button>
        <div className="auth-foot">
          Không nhận được? <a onClick={() => setSent(null)}>Gửi lại</a>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        <div className="auth-title">Quên mật khẩu</div>
        <div className="auth-sub">Nhập email công ty, hệ thống gửi link đặt lại.</div>

        <TextField<Values> name="email" label="Email" required type="email" placeholder="ban@reborn.vn" autoFocus />

        <button type="submit" className="btn primary" style={{ width: "100%", justifyContent: "center", marginTop: 6 }} disabled={submitting}>
          {submitting ? "Đang gửi..." : "Gửi link reset →"}
        </button>

        <div className="auth-foot">
          <a onClick={() => navigate("/login")}>← Quay lại đăng nhập</a>
        </div>
      </form>
    </FormProvider>
  );
}
