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
  const [forgotOpen, setForgotOpen] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = parseMemberCode(code);
    if (!parsed) {
      setError("Mã không đúng định dạng. VD: 5971-300");
      return;
    }
    setLoading(true);
    try {
      // API-first: POST /market/community-hub/members/login-by-code
      // Fallback LS khi network lỗi (dev local). BE verify bcrypt + rate-limit.
      const r = await memberStorage.loginByCodeAsync(code.trim(), password);
      if (!r.ok) {
        setError(r.reason ?? "Đăng nhập thất bại");
        return;
      }
      if (r.member) onSuccess(r.member);
    } finally {
      setLoading(false);
    }
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
            setForgotOpen(true);
          }}
          style={{ fontSize: 12, color: THEME.primary }}
        >
          Quên mật khẩu?
        </a>
      </div>
      {forgotOpen && <ForgotPasswordModal initialCode={code} onClose={() => setForgotOpen(false)} />}
    </form>
  );
}

// ── Quên mật khẩu — UI stub (chưa nối backend OTP). ────────────────────────
// UI cho user nhập mã + SĐT/email → "Gửi OTP" (button disabled) → form nhập OTP
// + mật khẩu mới. Submit hiện toast "tính năng đang phát triển — liên hệ admin".
// Sau khi BE có endpoints forgot-password + set-password thật → nối vào.
function ForgotPasswordModal({ initialCode, onClose }: { initialCode: string; onClose: () => void }) {
  const [step, setStep] = useState<"request" | "otp">("request");
  const [memberCode, setMemberCode] = useState(initialCode);
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [info] = useState<string>(
    "Tạm thời tính năng tự đặt mật khẩu chưa khả dụng. Vui lòng liên hệ BTC qua hotline để được hỗ trợ.",
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 10, padding: 20, width: 420, maxWidth: "100%",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>Quên mật khẩu</h3>
        <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: 12 }}>
          Đặt lại mật khẩu bằng OTP gửi qua SMS/email.
        </div>

        {/* Banner báo tính năng đang phát triển */}
        <div style={{
          background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E",
          padding: "8px 12px", borderRadius: 6, fontSize: 12, marginBottom: 14,
        }}>
          ⏳ <b>Đang phát triển</b> — {info}
        </div>

        {step === "request" ? (
          <>
            <Field label="Mã thành viên *">
              <input
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                placeholder="VD: 5971-300"
                style={inp}
              />
            </Field>
            <Field label="Số điện thoại hoặc email đã đăng ký *">
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="0xxx hoặc you@example.com"
                style={inp}
              />
            </Field>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={onClose} style={btnGhostMd}>Huỷ</button>
              <button
                disabled
                onClick={() => setStep("otp")}
                title="Tính năng đang phát triển"
                style={btnPrimaryDisabled}
              >
                Gửi OTP
              </button>
            </div>
          </>
        ) : (
          <>
            <Field label="Mã OTP (6 số)">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                style={inp}
              />
            </Field>
            <Field label="Mật khẩu mới">
              <input
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                style={inp}
              />
            </Field>
            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 12 }}>
              <button onClick={() => setStep("request")} style={btnGhostMd}>← Quay lại</button>
              <button
                disabled
                title="Tính năng đang phát triển"
                style={btnPrimaryDisabled}
              >
                Đặt mật khẩu mới
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: THEME.textMain, marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const btnGhostMd: React.CSSProperties = {
  padding: "8px 14px",
  background: "#fff",
  color: THEME.textMain,
  border: `1px solid ${THEME.border}`,
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
};

const btnPrimaryDisabled: React.CSSProperties = {
  padding: "8px 14px",
  background: "#9CA3AF",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "not-allowed",
  fontSize: 13,
  fontWeight: 600,
  opacity: 0.7,
};

function MemberSignupForm({ onSuccess }: { onSuccess: (reqId: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (submitted) {
    return (
      <div style={{ padding: 12, background: "#ECFDF5", color: "#065F46", borderRadius: 6, fontSize: 13 }}>
        ✓ Yêu cầu cấp mã đã gửi. BTC sẽ liên hệ qua SĐT <b>{phone}</b> để cấp mã chính thức.
        <br />
        <span style={{ fontSize: 12 }}>Mã yêu cầu: {submitted}</span>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    try {
      // API: POST /market/community-hub/members/signup-request/create
      const r = await memberStorage.createRequestAsync({
        fullName: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        occupation: occupation.trim() || undefined,
      });
      setSubmitted(r.id);
      onSuccess(r.id);
    } catch (err: any) {
      setError(err?.message || "Không gửi được yêu cầu cấp mã");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ tên *" required style={inp} />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại *" required style={inp} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" type="email" style={inp} />
      <input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="Công việc hiện tại" style={inp} />
      {error && <div style={{ fontSize: 12, color: THEME.danger }}>{error}</div>}
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
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
          alignSelf: "flex-start",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Đang gửi..." : "Gửi yêu cầu cấp mã"}
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
