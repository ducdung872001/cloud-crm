// Switch giữa 3 luồng đăng ký A/B/C trên ShareEventPage. Yc 5/5 mục 2.
//
//  - A "guest"          : chỉ tên + SĐT — đăng ký nhanh demo, không có mã
//  - B "member_signup"  : yêu cầu cấp mã định danh mới (admin duyệt rồi cấp)
//  - C "member_login"   : login bằng mã + mật khẩu, auto-fill thông tin đã lưu
//
// Component này chỉ render UI chọn flow + form login/signup. Khi user đã chọn
// flow A hoặc đã login flow C → callback `onReady(state)` để parent tự render
// form đăng ký với prefill phù hợp.

import React, { useState } from "react";
import { THEME } from "../shared";
import { memberStorage } from "../../Members/storage";
import { parseMemberCode } from "../../Members/codeUtils";
import type { MemberEntity } from "../../Members/types";

export type RegFlow = "guest" | "member_signup" | "member_login";

export interface FlowReadyState {
  flow: RegFlow;
  /** Khi flow=member_login: member object đã verify; prefill form */
  member?: MemberEntity;
  /** Khi flow=member_signup: thông tin yêu cầu mã đã được tạo */
  signupReqId?: string;
}

interface Props {
  /** Các luồng được event này bật. Mặc định ["guest"]. */
  enabledFlows?: RegFlow[];
  onReady: (state: FlowReadyState) => void;
}

export default function RegistrationFlowSwitcher({ enabledFlows = ["guest"], onReady }: Props) {
  const [active, setActive] = useState<RegFlow | null>(
    enabledFlows.length === 1 ? enabledFlows[0] : null,
  );

  // Nếu chỉ có 1 flow là guest → không cần switcher, parent tự render form luôn.
  if (enabledFlows.length === 1 && enabledFlows[0] === "guest") {
    // Auto-ready
    if (active === "guest") return null;
  }

  return (
    <div style={{ background: "#F8FBFA", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 12, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: THEME.textMain }}>
        Bạn muốn đăng ký theo cách nào?
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {enabledFlows.includes("member_login") && (
          <FlowTab id="member_login" label="🔑 Đã có mã thành viên" active={active === "member_login"} onClick={() => setActive("member_login")} />
        )}
        {enabledFlows.includes("guest") && (
          <FlowTab id="guest" label="🎟️ Đăng ký nhanh (chưa có mã)" active={active === "guest"} onClick={() => { setActive("guest"); onReady({ flow: "guest" }); }} />
        )}
        {enabledFlows.includes("member_signup") && (
          <FlowTab id="member_signup" label="🆔 Tôi muốn đăng ký mã thành viên mới" active={active === "member_signup"} onClick={() => setActive("member_signup")} />
        )}
      </div>

      {active === "member_login" && (
        <MemberLoginForm onSuccess={(m) => onReady({ flow: "member_login", member: m })} />
      )}

      {active === "member_signup" && (
        <MemberSignupForm onSuccess={(reqId) => onReady({ flow: "member_signup", signupReqId: reqId })} />
      )}

      {active === "guest" && (
        <p style={{ fontSize: 12, color: THEME.textMuted, margin: 0 }}>
          ✓ Bạn sẽ điền form bên dưới với tên + SĐT.
        </p>
      )}
    </div>
  );
}

function FlowTab({ id, label, active, onClick }: { id: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      key={id}
      onClick={onClick}
      style={{
        padding: "8px 14px",
        background: active ? THEME.primary : "#fff",
        color: active ? "#fff" : THEME.textMain,
        border: `1.5px solid ${active ? THEME.primary : THEME.border}`,
        borderRadius: 20,
        fontSize: 13,
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}

function MemberLoginForm({ onSuccess }: { onSuccess: (m: MemberEntity) => void }) {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = parseMemberCode(code);
    if (!parsed) {
      setError("Mã không đúng định dạng. VD: 5971-300");
      return;
    }
    setLoading(true);
    // Local-only login. BE: POST /community-hub/members/login
    const r = memberStorage.loginByCode(code.trim(), password);
    setLoading(false);
    if (!r.ok) {
      setError(r.reason ?? "Đăng nhập thất bại");
      return;
    }
    if (r.member) onSuccess(r.member);
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Mã thành viên (VD: 5971-300)"
        required
        autoFocus
        style={inp}
      />
      <div style={{ position: "relative" }}>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          type={showPwd ? "text" : "password"}
          required
          style={{ ...inp, paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={() => setShowPwd((v) => !v)}
          aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          title={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          style={{
            position: "absolute",
            top: "50%",
            right: 6,
            transform: "translateY(-50%)",
            width: 32,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: THEME.textMuted,
            fontSize: 16,
            padding: 0,
            lineHeight: 1,
          }}
        >
          {showPwd ? "🙈" : "👁"}
        </button>
      </div>
      {error && <div style={{ fontSize: 12, color: THEME.danger }}>{error}</div>}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: THEME.primary,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Vui lòng liên hệ admin để được reset mật khẩu (giai đoạn đầu — yc khách 5/5).");
          }}
          style={{ fontSize: 12, color: THEME.primary }}
        >
          Quên mật khẩu?
        </a>
      </div>
    </form>
  );
}

function MemberSignupForm({ onSuccess }: { onSuccess: (reqId: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  if (submitted) {
    return (
      <div style={{ padding: 12, background: "#ECFDF5", color: "#065F46", borderRadius: 6, fontSize: 13 }}>
        ✓ Yêu cầu cấp mã đã gửi. BTC sẽ liên hệ qua SĐT <b>{phone}</b> để cấp mã chính thức.
        <br />
        <span style={{ fontSize: 12 }}>Mã yêu cầu: {submitted}</span>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const r = memberStorage.createRequest({
      fullName: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      occupation: occupation.trim() || undefined,
    });
    setSubmitted(r.id);
    onSuccess(r.id);
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ tên *" required style={inp} />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại *" required style={inp} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" type="email" style={inp} />
      <input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="Công việc hiện tại" style={inp} />
      <button
        type="submit"
        style={{
          padding: "8px 16px",
          background: THEME.primary,
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontSize: 13,
          cursor: "pointer",
          fontWeight: 600,
          alignSelf: "flex-start",
        }}
      >
        Gửi yêu cầu cấp mã
      </button>
      <p style={{ fontSize: 11, color: THEME.textMuted, margin: 0 }}>
        Sau khi gửi, BTC sẽ kiểm tra và cấp mã định danh dạng <code>STT-nhóm</code> (vd 5971-300).
        Bạn vẫn có thể đăng ký tham gia sự kiện ngay bằng luồng "đăng ký nhanh".
      </p>
    </form>
  );
}

const inp: React.CSSProperties = {
  padding: "8px 10px",
  border: `1px solid ${THEME.border}`,
  borderRadius: 6,
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
