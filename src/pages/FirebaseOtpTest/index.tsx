import React, { useEffect, useRef, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  ConfirmationResult,
  Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

function normalizePhone(input: string): string {
  const raw = (input || "").trim().replace(/\s+/g, "");
  if (!raw) return "";
  if (raw.startsWith("+")) return raw;
  if (raw.startsWith("00")) return "+" + raw.slice(2);
  if (raw.startsWith("84")) return "+" + raw;
  if (raw.startsWith("0")) return "+84" + raw.slice(1);
  return "+84" + raw;
}

const FirebaseOtpTest: React.FC = () => {
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState<boolean>(false);
  const [verifiedUser, setVerifiedUser] = useState<{ uid: string; phoneNumber: string | null } | null>(null);

  const authRef = useRef<Auth | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmRef = useRef<ConfirmationResult | null>(null);

  const log = (msg: string, data?: unknown) => {
    const stamp = new Date().toLocaleTimeString();
    const line = data !== undefined ? `[${stamp}] ${msg} ${typeof data === "string" ? data : JSON.stringify(data)}` : `[${stamp}] ${msg}`;
    // eslint-disable-next-line no-console
    console.log("[FirebaseOtpTest]", msg, data ?? "");
    setLogs((prev) => [...prev, line]);
  };

  useEffect(() => {
    try {
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      const auth = getAuth(app);
      auth.languageCode = "vi";
      authRef.current = auth;
      log("Firebase init OK", { projectId: firebaseConfig.projectId, authDomain: firebaseConfig.authDomain });
    } catch (e: any) {
      log("Firebase init FAILED", e?.message || String(e));
    }
    return () => {
      try { verifierRef.current?.clear(); } catch { /* noop */ }
      verifierRef.current = null;
    };
  }, []);

  const ensureVerifier = (): RecaptchaVerifier => {
    if (verifierRef.current) return verifierRef.current;
    if (!authRef.current) throw new Error("Auth chưa init");
    const verifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => log("reCAPTCHA solved"),
        "expired-callback": () => log("reCAPTCHA expired"),
      },
      authRef.current
    );
    verifierRef.current = verifier;
    return verifier;
  };

  const handleSendOtp = async () => {
    const e164 = normalizePhone(phone);
    if (!/^\+[1-9]\d{6,14}$/.test(e164)) {
      log("Số điện thoại không hợp lệ (E.164 expected)", e164);
      return;
    }
    setBusy(true);
    setVerifiedUser(null);
    try {
      const verifier = ensureVerifier();
      log("Gửi OTP đến", e164);
      const confirmation = await signInWithPhoneNumber(authRef.current!, e164, verifier);
      confirmRef.current = confirmation;
      log("Đã gửi OTP, chờ nhập mã 6 số");
    } catch (e: any) {
      log("signInWithPhoneNumber LỖI", { code: e?.code, message: e?.message });
      try { verifierRef.current?.clear(); } catch { /* noop */ }
      verifierRef.current = null;
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (!confirmRef.current) {
      log("Chưa có confirmationResult — bấm 'Gửi OTP' trước");
      return;
    }
    const code = (otp || "").trim();
    if (!/^\d{4,8}$/.test(code)) {
      log("Mã OTP không hợp lệ");
      return;
    }
    setBusy(true);
    try {
      const result = await confirmRef.current.confirm(code);
      const u = result.user;
      setVerifiedUser({ uid: u.uid, phoneNumber: u.phoneNumber });
      log("✔ Xác thực thành công", { uid: u.uid, phoneNumber: u.phoneNumber });
    } catch (e: any) {
      log("confirm OTP LỖI", { code: e?.code, message: e?.message });
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    try { await signOut(authRef.current!); } catch { /* noop */ }
    try { verifierRef.current?.clear(); } catch { /* noop */ }
    verifierRef.current = null;
    confirmRef.current = null;
    setOtp("");
    setVerifiedUser(null);
    setLogs([]);
    log("Đã reset");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7f9", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <h1 style={{ marginTop: 0, fontSize: 22 }}>Firebase Phone OTP — Test</h1>
        <p style={{ color: "#666", marginTop: -8, fontSize: 13 }}>
          Project: <code>{firebaseConfig.projectId || "(chưa cấu hình)"}</code> · authDomain: <code>{firebaseConfig.authDomain || "—"}</code>
        </p>
        <p style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
          Mẹo: số test cấu hình ở Firebase Console → Authentication → Sign-in method → Phone → <em>Phone numbers for testing</em> sẽ không tốn SMS.
          Domain hiện tại phải nằm trong <em>Authorized domains</em>.
        </p>

        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <input
            placeholder="VD: 0898348348 hoặc +84898348348"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ flex: "1 1 260px", padding: "10px 12px", border: "1px solid #d0d4dc", borderRadius: 8, fontSize: 14 }}
            disabled={busy}
          />
          <button
            onClick={handleSendOtp}
            disabled={busy || !phone}
            style={{ padding: "10px 16px", background: "#2563eb", color: "#fff", border: 0, borderRadius: 8, cursor: busy ? "not-allowed" : "pointer", fontSize: 14 }}
          >
            {busy ? "Đang gửi..." : "Gửi OTP"}
          </button>
        </div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
          Chuẩn hoá → <code>{normalizePhone(phone) || "(trống)"}</code>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <input
            placeholder="Mã OTP 6 số"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            maxLength={8}
            style={{ flex: "1 1 260px", padding: "10px 12px", border: "1px solid #d0d4dc", borderRadius: 8, fontSize: 14, letterSpacing: 2 }}
            disabled={busy}
          />
          <button
            onClick={handleVerify}
            disabled={busy || !otp}
            style={{ padding: "10px 16px", background: "#16a34a", color: "#fff", border: 0, borderRadius: 8, cursor: busy ? "not-allowed" : "pointer", fontSize: 14 }}
          >
            Xác thực
          </button>
          <button
            onClick={handleReset}
            disabled={busy}
            style={{ padding: "10px 16px", background: "#fff", color: "#374151", border: "1px solid #d0d4dc", borderRadius: 8, cursor: busy ? "not-allowed" : "pointer", fontSize: 14 }}
          >
            Reset
          </button>
        </div>

        {verifiedUser && (
          <div style={{ marginTop: 16, padding: 12, background: "#ecfdf5", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 14 }}>
            <div><strong>✔ Đã xác thực</strong></div>
            <div>uid: <code>{verifiedUser.uid}</code></div>
            <div>phoneNumber: <code>{verifiedUser.phoneNumber}</code></div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 6 }}>Log</div>
          <pre style={{ background: "#0b1020", color: "#cfe3ff", padding: 12, borderRadius: 8, fontSize: 12, lineHeight: 1.5, maxHeight: 280, overflow: "auto", margin: 0 }}>
            {logs.length ? logs.join("\n") : "(chưa có)"}
          </pre>
        </div>

        <div id="recaptcha-container" />
      </div>
    </div>
  );
};

export default FirebaseOtpTest;
