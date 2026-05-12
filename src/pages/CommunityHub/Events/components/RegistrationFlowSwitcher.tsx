// Switch giữa 3 luồng đăng ký A/B/C trên ShareEventPage. Yc 5/5 mục 2.
//
//  - A "guest"          : chỉ tên + SĐT — đăng ký nhanh demo, không có mã
//  - B "member_signup"  : yêu cầu cấp mã định danh mới (admin duyệt rồi cấp)
//  - C "member_login"   : login bằng mã + mật khẩu, auto-fill thông tin đã lưu
//
// Component này chỉ render UI chọn flow + form login/signup. Khi user đã chọn
// flow A hoặc đã login flow C → callback `onReady(state)` để parent tự render
// form đăng ký với prefill phù hợp.

import React, { useEffect, useRef, useState } from "react";
import { THEME } from "../shared";
import { memberStorage } from "../../Members/storage";
import { parseMemberCode } from "../../Members/codeUtils";
import type { MemberEntity } from "../../Members/types";
import {
  createRecaptchaVerifier,
  isValidVNPhone,
  isFirebasePhoneAuthAvailable,
  sendPhoneOtp,
  toE164VN,
  verifyOtpAndGetIdToken,
} from "../../Members/firebasePhoneOtp";
import type { ConfirmationResult } from "firebase/auth";

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
          style={{ fontSize: 12, color: THEME.primary, fontWeight: 600 }}
        >
          Đặt / quên mật khẩu?
        </a>
      </div>
      <p style={{ fontSize: 11, color: THEME.textMuted, margin: "6px 0 0" }}>
        Lần đầu nhận mã thành viên? Bấm <b>"Đặt / quên mật khẩu?"</b> để đặt mật khẩu qua OTP.
      </p>
      {forgotOpen && <ForgotPasswordModal initialCode={code} onClose={() => setForgotOpen(false)} />}
    </form>
  );
}

// ── Quên mật khẩu — wire Firebase Phone OTP per BE flow 2026-05-12 ─────────
// Flow:
//   1. User nhập memberCode + phone → click "Gửi OTP" → Firebase SDK signInWithPhoneNumber
//      → Firebase gửi SMS OTP (sender Firebase default, không brandname VN)
//   2. User nhập OTP → confirm → idToken Firebase
//   3. User nhập pwd mới → POST /community-hub/members/set-password
//      body: { memberCode, firebaseIdToken, newPassword }
//      → Market call Auth verify idToken nội bộ → match phone với members.phone
//      → bcrypt + update → 200
//
// Caveat: cần `<div id="ch-recaptcha-container">` trong DOM (mount invisible).
function ForgotPasswordModal({ initialCode, onClose }: { initialCode: string; onClose: () => void }) {
  const [step, setStep] = useState<"request" | "otp" | "newpwd">("request");
  const [memberCode, setMemberCode] = useState(initialCode);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Confirmation result từ Firebase — cần ở step 2 để confirm OTP.
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  // ── Step 1 → 2: gửi OTP qua Firebase ────────────────────────────────────
  const handleSendOtp = async () => {
    setError(null);
    if (!parseMemberCode(memberCode.trim())) {
      setError("Mã không đúng định dạng. VD: 5971-300");
      return;
    }
    if (!isValidVNPhone(phone)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }
    if (!isFirebasePhoneAuthAvailable) {
      setError("Firebase chưa cấu hình — liên hệ admin để bật biến môi trường.");
      return;
    }
    setLoading(true);
    try {
      const verifier = createRecaptchaVerifier("ch-recaptcha-container");
      const e164 = toE164VN(phone);
      const confirmation = await sendPhoneOtp(e164, verifier);
      confirmationRef.current = confirmation;
      setInfo(`Đã gửi OTP tới ${maskPhone(phone)}. Mã có hiệu lực 5 phút.`);
      setStep("otp");
    } catch (e: any) {
      const msg = e?.message || String(e);
      setError(`Gửi OTP thất bại: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 → 3: verify OTP + lấy idToken ────────────────────────────────
  const handleVerifyOtp = async () => {
    setError(null);
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Vui lòng nhập đủ 6 chữ số OTP");
      return;
    }
    if (!confirmationRef.current) {
      setError("Phiên OTP hết hạn — vui lòng gửi lại");
      setStep("request");
      return;
    }
    setLoading(true);
    try {
      const idToken = await verifyOtpAndGetIdToken(confirmationRef.current, otp);
      // Lưu idToken tạm vào ref để dùng ở step set-password.
      (confirmationRef as any).idToken = idToken;
      setInfo("✓ OTP xác minh thành công. Nhập mật khẩu mới để hoàn tất.");
      setStep("newpwd");
    } catch (e: any) {
      const msg = e?.message || String(e);
      setError(/auth\/invalid-verification-code/.test(msg) ? "Mã OTP không đúng" : `Verify thất bại: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: gọi BE set-password ─────────────────────────────────────────
  const handleSetPassword = async () => {
    setError(null);
    if (newPwd.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    const idToken: string | undefined = (confirmationRef as any).idToken;
    if (!idToken) {
      setError("Thiếu idToken — vui lòng làm lại từ đầu");
      setStep("request");
      return;
    }
    setLoading(true);
    try {
      const r = await memberStorage.setPasswordAsync({
        memberCode: memberCode.trim(),
        firebaseIdToken: idToken,
        newPassword: newPwd,
      });
      if (!r.ok) {
        setError(r.reason || "Đặt mật khẩu thất bại");
        return;
      }
      setInfo("✓ Đã đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay.");
      setTimeout(onClose, 1500);
    } catch (e: any) {
      setError(e?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => { if (!loading) onClose(); }}
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
        <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>Đặt mật khẩu</h3>
        <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: 12 }}>
          {step === "request" && (
            <>
              Nhập mã thành viên + SĐT đã đăng ký để nhận OTP qua SMS.<br />
              <span style={{ color: THEME.primary, fontWeight: 600 }}>
                Cũng dùng để đặt mật khẩu LẦN ĐẦU sau khi được cấp mã.
              </span>
            </>
          )}
          {step === "otp" && "Nhập 6 chữ số OTP đã gửi qua SMS."}
          {step === "newpwd" && "Đặt mật khẩu (≥ 6 ký tự)."}
        </div>

        {info && (
          <div style={{
            background: "#ECFDF5", border: "1px solid #BBF7D0", color: "#065F46",
            padding: "8px 12px", borderRadius: 6, fontSize: 12, marginBottom: 10,
          }}>
            {info}
          </div>
        )}
        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B",
            padding: "8px 12px", borderRadius: 6, fontSize: 12, marginBottom: 10,
          }}>
            ⚠ {error}
          </div>
        )}

        {step === "request" && (
          <>
            <Field label="Mã thành viên *">
              <input
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                placeholder="VD: 5971-300"
                style={inp}
              />
            </Field>
            <Field label="Số điện thoại đã đăng ký *">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912345678"
                style={inp}
              />
            </Field>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={onClose} disabled={loading} style={btnGhostMd}>Huỷ</button>
              <button
                disabled={loading}
                onClick={handleSendOtp}
                style={btnPrimary(loading)}
              >
                {loading ? "Đang gửi..." : "Gửi OTP"}
              </button>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <Field label="Mã OTP (6 số)">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                inputMode="numeric"
                style={{ ...inp, letterSpacing: 4, fontFamily: "monospace", fontSize: 16 }}
                autoFocus
              />
            </Field>
            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 12 }}>
              <button onClick={() => setStep("request")} disabled={loading} style={btnGhostMd}>← Quay lại</button>
              <button
                disabled={loading}
                onClick={handleVerifyOtp}
                style={btnPrimary(loading)}
              >
                {loading ? "Đang xác minh..." : "Xác minh OTP"}
              </button>
            </div>
          </>
        )}

        {step === "newpwd" && (
          <>
            <Field label="Mật khẩu mới *">
              <div style={{ position: "relative" }}>
                <input
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  type={showNewPwd ? "text" : "password"}
                  placeholder="Tối thiểu 6 ký tự"
                  style={{ ...inp, paddingRight: 44 }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((v) => !v)}
                  aria-label={showNewPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  title={showNewPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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
                  {showNewPwd ? "🙈" : "👁"}
                </button>
              </div>
            </Field>
            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 12 }}>
              <button onClick={() => setStep("otp")} disabled={loading} style={btnGhostMd}>← Quay lại</button>
              <button
                disabled={loading}
                onClick={handleSetPassword}
                style={btnPrimary(loading)}
              >
                {loading ? "Đang đặt..." : "Đặt mật khẩu mới"}
              </button>
            </div>
          </>
        )}

        {/* Invisible recaptcha — Firebase yêu cầu mount trước khi gọi signInWithPhoneNumber.
            Phải có element id này tồn tại trong DOM. */}
        <div id="ch-recaptcha-container" style={{ display: "none" }} />
      </div>
    </div>
  );
}

/** Mask phone để hiện toast user-friendly: 0912345678 → 091***5678. */
function maskPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length < 6) return phone;
  return digits.slice(0, 3) + "***" + digits.slice(-4);
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

const btnPrimary = (loading: boolean): React.CSSProperties => ({
  padding: "8px 14px",
  background: loading ? "#9CA3AF" : THEME.primary,
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: loading ? "not-allowed" : "pointer",
  fontSize: 13,
  fontWeight: 600,
  opacity: loading ? 0.7 : 1,
});

// ── MemberSignupForm — OTP-first 2-step (yc Hiền Đỗ + BE 2026-05-12) ──────
// Step 1: User nhập SĐT → Firebase SDK gửi SMS OTP → user confirm → idToken
// Step 2: User nhập tên + email + occupation → POST /signup-request/create
//         body có thêm `firebaseIdToken` → BE verify qua Auth, set phoneVerified=true
//
// Admin tab "Yêu cầu cấp mã" sẽ thấy badge "📱 SĐT đã verify" cho request loại
// này → có thể duyệt mà không cần gọi điện xác minh.
function MemberSignupForm({ onSuccess }: { onSuccess: (reqId: string) => void }) {
  const [step, setStep] = useState<"phone" | "otp" | "info">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [submitted, setSubmitted] = useState<{ id: string; verified: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const idTokenRef = useRef<string | null>(null);

  if (submitted) {
    return (
      <div style={{ padding: 12, background: "#ECFDF5", color: "#065F46", borderRadius: 6, fontSize: 13 }}>
        ✓ Yêu cầu cấp mã đã gửi.
        {submitted.verified && (
          <span style={{ display: "inline-block", marginLeft: 6, padding: "2px 8px", background: "#BBF7D0", color: "#065F46", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
            📱 SĐT đã verify
          </span>
        )}
        <br />
        BTC sẽ liên hệ qua SĐT <b>{phone}</b> để cấp mã chính thức.
        <br />
        <span style={{ fontSize: 12 }}>Mã yêu cầu: {submitted.id}</span>
      </div>
    );
  }

  // ── Step 1: gửi OTP qua Firebase ───────────────────────────────────────
  const handleSendOtp = async () => {
    setError(null); setInfo(null);
    if (!isValidVNPhone(phone)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }
    if (!isFirebasePhoneAuthAvailable) {
      // Fallback Phase 1 — bỏ qua OTP, gửi thẳng signup-request (admin duyệt thủ công).
      setInfo("Firebase chưa cấu hình — chuyển sang chế độ admin duyệt thủ công.");
      setStep("info");
      return;
    }
    setLoading(true);
    try {
      const verifier = createRecaptchaVerifier("ch-signup-recaptcha");
      const e164 = toE164VN(phone);
      const confirmation = await sendPhoneOtp(e164, verifier);
      confirmationRef.current = confirmation;
      setInfo(`Đã gửi OTP tới ${maskPhone(phone)}. Mã có hiệu lực 5 phút.`);
      setStep("otp");
    } catch (e: any) {
      setError(`Gửi OTP thất bại: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP → lấy idToken → chuyển sang form info ───────────
  const handleVerifyOtp = async () => {
    setError(null);
    if (!/^\d{6}$/.test(otp)) {
      setError("Vui lòng nhập đủ 6 chữ số OTP");
      return;
    }
    if (!confirmationRef.current) {
      setError("Phiên OTP hết hạn — vui lòng gửi lại");
      setStep("phone");
      return;
    }
    setLoading(true);
    try {
      const token = await verifyOtpAndGetIdToken(confirmationRef.current, otp);
      idTokenRef.current = token;
      setInfo("✓ SĐT đã xác minh. Vui lòng điền thông tin còn lại.");
      setStep("info");
    } catch (e: any) {
      const msg = e?.message || String(e);
      setError(/auth\/invalid-verification-code/.test(msg) ? "Mã OTP không đúng" : `Verify thất bại: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: gửi signup-request ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    setLoading(true);
    try {
      const r = await memberStorage.createRequestAsync({
        fullName: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        occupation: occupation.trim() || undefined,
        firebaseIdToken: idTokenRef.current ?? undefined,
      });
      setSubmitted({ id: r.id, verified: !!idTokenRef.current });
      onSuccess(r.id);
    } catch (err: any) {
      setError(err?.message || "Không gửi được yêu cầu cấp mã");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Progress dots */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        {(["phone", "otp", "info"] as const).map((s, i) => {
          const order = ["phone", "otp", "info"];
          const active = order.indexOf(step) >= i;
          return (
            <React.Fragment key={s}>
              {i > 0 && <div style={{ flex: 1, height: 1, background: active ? THEME.primary : THEME.border }} />}
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: active ? THEME.primary : THEME.border,
                color: "#fff", fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{i + 1}</div>
            </React.Fragment>
          );
        })}
      </div>

      {info && (
        <div style={{
          background: "#ECFDF5", border: "1px solid #BBF7D0", color: "#065F46",
          padding: "6px 10px", borderRadius: 6, fontSize: 12,
        }}>{info}</div>
      )}
      {error && (
        <div style={{
          background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B",
          padding: "6px 10px", borderRadius: 6, fontSize: 12,
        }}>⚠ {error}</div>
      )}

      {step === "phone" && (
        <>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Số điện thoại * (VD: 0912345678)"
            style={inp}
            autoFocus
          />
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading}
            style={{ ...btnPrimary(loading), alignSelf: "flex-start" }}
          >
            {loading ? "Đang gửi OTP..." : "📱 Gửi OTP qua SMS"}
          </button>
          <p style={{ fontSize: 11, color: THEME.textMuted, margin: 0 }}>
            BTC cần xác minh SĐT thật trước khi tạo yêu cầu. SMS sẽ được gửi qua Firebase
            (sender mặc định Google, không brandname).
          </p>
        </>
      )}

      {step === "otp" && (
        <>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
            placeholder="6 chữ số OTP"
            maxLength={6}
            inputMode="numeric"
            style={{ ...inp, letterSpacing: 4, fontFamily: "monospace", fontSize: 16 }}
            autoFocus
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setStep("phone")} disabled={loading} style={btnGhostMd}>
              ← Đổi SĐT
            </button>
            <button type="button" onClick={handleVerifyOtp} disabled={loading} style={btnPrimary(loading)}>
              {loading ? "Đang xác minh..." : "Xác minh OTP"}
            </button>
          </div>
        </>
      )}

      {step === "info" && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ tên *" required style={inp} autoFocus />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" type="email" style={inp} />
          <input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="Công việc hiện tại" style={inp} />
          <button type="submit" disabled={loading} style={{ ...btnPrimary(loading), alignSelf: "flex-start" }}>
            {loading ? "Đang gửi..." : "Gửi yêu cầu cấp mã"}
          </button>
          <p style={{ fontSize: 11, color: THEME.textMuted, margin: 0 }}>
            BTC sẽ kiểm tra và cấp mã định danh dạng <code>STT-nhóm</code> (vd 5971-300).
          </p>
        </form>
      )}

      {/* Invisible recaptcha — Firebase yêu cầu mount trước khi gọi signInWithPhoneNumber. */}
      <div id="ch-signup-recaptcha" style={{ display: "none" }} />
    </div>
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
