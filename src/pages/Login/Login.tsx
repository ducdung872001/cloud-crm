import React, { useState, useEffect } from "react";
import { useApp } from "contexts/AppContext";
import { apiPost } from "configs/apiClient";

// ── Helpers ────────────────────────────────────────────────────────────
function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name: string, value: string, days = 1) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
}

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const { showToast } = useApp();
  const [form,    setForm]    = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // Auto-redirect to SSO if configured
  useEffect(() => {
    const ssoUrl = process.env.APP_AUTHENTICATOR_URL;
    // Only auto-SSO in production; in dev, show login form
    if (ssoUrl && process.env.NODE_ENV === "production") {
      const redirectUri = encodeURIComponent(window.location.href);
      window.location.href = `${ssoUrl}/login?redirect_uri=${redirectUri}`;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu"); return;
    }
    setLoading(true);
    setError("");
    try {
      // POST /authenticator/user/login
      const res = await apiPost("/authenticator/user/login", {
        username: form.username,
        password: form.password,
      });

      if (res?.code === 0 || res?.result?.token) {
        const token = res.result?.token || res.token;
        const user  = res.result?.user  || res.user;

        // Persist token in cookie (same as retail)
        setCookie("token", token, 1);
        setCookie("user",  JSON.stringify(user), 1);

        // Load permissions
        try {
          const permRes = await fetch(`${process.env.APP_API_URL || ""}/adminapi/permission/resource`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const permData = await permRes.json();
          const mapPerm: Record<string, number> = {};
          (permData.result || []).forEach((r: any) => {
            try {
              JSON.parse(r.actions || "[]").forEach((a: string) => {
                mapPerm[`${r.code}_${a}`] = 1;
              });
            } catch {}
          });
          localStorage.setItem("permissions", JSON.stringify(mapPerm));
        } catch {}

        showToast(`Chào mừng, ${user?.name || form.username}!`, "success");
        onLogin(user);
      } else {
        setError(res?.message || "Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (err: any) {
      setError("Lỗi kết nối tới server. Kiểm tra lại cấu hình API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--navy)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background pattern */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.03 }}>
        <svg width="100%" height="100%"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
      </div>

      {/* Accent orbs */}
      <div style={{ position: "absolute", top: -120, left: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(33,150,243,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{
        width: "100%",
        maxWidth: 440,
        background: "var(--navy-mid)",
        border: "1px solid var(--border-hover)",
        borderRadius: 20,
        padding: "40px 44px 48px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: "var(--accent)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, fill: "none", stroke: "white", strokeWidth: 2, strokeLinecap: "round" }}>
              <path d="M3 21h18M3 10h18M3 6l9-3 9 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.5 }}>
              CRM<span style={{ color: "var(--accent-bright)" }}>Banking</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Reborn JSC · Sales Management</div>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Đăng nhập hệ thống</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Nhập thông tin tài khoản để tiếp tục</div>
        </div>

        {error && (
          <div style={{ background: "var(--danger-soft)", border: "1px solid rgba(255,71,87,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--danger)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: "var(--danger)", fill: "none", strokeWidth: 2, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Tên đăng nhập
            </label>
            <div style={{ position: "relative" }}>
              <svg viewBox="0 0 24 24" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, stroke: "var(--text-muted)", fill: "none", strokeWidth: 2, strokeLinecap: "round" }}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="username@rebornbank.vn"
                value={form.username}
                onChange={e => set("username", e.target.value)}
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Mật khẩu
              </label>
              <span style={{ fontSize: 12, color: "var(--accent-bright)", cursor: "pointer" }} onClick={() => alert("Liên hệ Admin để đặt lại mật khẩu")}>
                Quên mật khẩu?
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <svg viewBox="0 0 24 24" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, stroke: "var(--text-muted)", fill: "none", strokeWidth: 2, strokeLinecap: "round" }}>
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => set("password", e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", height: 44, borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "var(--navy-light)" : "var(--accent)", color: "white",
              fontSize: 14, fontWeight: 600, fontFamily: "var(--font)",
              transition: "all 0.2s", opacity: loading ? 0.8 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Đang đăng nhập…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: "white", fill: "none", strokeWidth: 2, strokeLinecap: "round" }}>
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Đăng nhập
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
          Phiên làm việc được bảo mật bằng JWT · TLS 1.3
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
