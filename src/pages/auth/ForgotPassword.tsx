import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, Input } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { submitting, submit } = useFormStub("Email reset đã gửi", "Kiểm tra hộp thư trong 5 phút");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(() => setSent(true));
  };

  if (sent) {
    return (
      <div>
        <div className="auth-title">Đã gửi email</div>
        <div className="auth-sub">
          Hướng dẫn đặt lại mật khẩu đã gửi đến <strong>{email}</strong>. Link có hiệu lực 15 phút.
        </div>
        <button type="button" className="btn primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate("/login")}>
          ← Quay lại đăng nhập
        </button>
        <div className="auth-foot">
          Không nhận được? <a onClick={() => setSent(false)}>Gửi lại</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="auth-title">Quên mật khẩu</div>
      <div className="auth-sub">Nhập email công ty, hệ thống gửi link đặt lại.</div>

      <Field label="Email" required>
        <Input type="email" placeholder="ban@reborn.vn" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      </Field>

      <button type="submit" className="btn primary" style={{ width: "100%", justifyContent: "center", marginTop: 6 }} disabled={submitting}>
        {submitting ? "Đang gửi..." : "Gửi link reset →"}
      </button>

      <div className="auth-foot">
        <a onClick={() => navigate("/login")}>← Quay lại đăng nhập</a>
      </div>
    </form>
  );
}
