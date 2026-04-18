import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, Input } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const { submitting, submit } = useFormStub("Mật khẩu đã đổi", "Đăng nhập với mật khẩu mới");

  const error = pw && pw2 && pw !== pw2 ? "Mật khẩu nhập lại không khớp" : undefined;
  const weak = pw && pw.length < 8 ? "Mật khẩu tối thiểu 8 ký tự" : undefined;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error || weak) return;
    submit(() => navigate("/login"));
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="auth-title">Đặt mật khẩu mới</div>
      <div className="auth-sub">Tối thiểu 8 ký tự, gồm chữ + số.</div>

      <Field label="Mật khẩu mới" required error={weak}>
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required autoFocus />
      </Field>
      <Field label="Nhập lại mật khẩu" required error={error}>
        <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
      </Field>

      <button
        type="submit"
        className="btn primary"
        style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
        disabled={submitting || !!error || !!weak || !pw || !pw2}
      >
        {submitting ? "Đang cập nhật..." : "Cập nhật mật khẩu →"}
      </button>
    </form>
  );
}
