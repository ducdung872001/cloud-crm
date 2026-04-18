import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, Input, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const { submitting, submit } = useFormStub("Đăng nhập thành công", "Chuyển về Projects Hub");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(() => navigate("/hub"));
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="auth-title">Đăng nhập</div>
      <div className="auth-sub">Dùng tài khoản Reborn hoặc SSO công ty.</div>

      <button type="button" className="btn" style={{ width: "100%", justifyContent: "center" }}>
        <span>🇬</span> Tiếp tục với Google
      </button>
      <button type="button" className="btn" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
        <span>Ⓜ</span> Tiếp tục với Microsoft
      </button>

      <div className="auth-divider">hoặc email</div>

      <Field label="Email" required>
        <Input type="email" placeholder="ban@reborn.vn" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      </Field>
      <Field
        label={
          <span style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            Mật khẩu <span className="field-required">*</span>
            <a
              style={{ color: "var(--teal-500)", cursor: "pointer", fontWeight: 500, marginLeft: "auto" }}
              onClick={() => navigate("/forgot-password")}
            >
              Quên?
            </a>
          </span>
        }
      >
        <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </Field>

      <Checkbox label="Ghi nhớ thiết bị 30 ngày" checked={remember} onChange={setRemember} />

      <button type="submit" className="btn primary" style={{ width: "100%", justifyContent: "center", marginTop: 14 }} disabled={submitting}>
        {submitting ? "Đang đăng nhập..." : "Đăng nhập →"}
      </button>

      <div className="auth-foot">
        Chưa có tài khoản? <a onClick={() => navigate("/signup")}>Liên hệ Admin</a>
      </div>
    </form>
  );
}
