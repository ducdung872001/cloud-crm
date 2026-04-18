import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileModal from "../forms/auth/ProfileModal";
import ChangePasswordModal from "../forms/auth/ChangePasswordModal";
import TwoFactorModal from "../forms/auth/TwoFactorModal";
import SessionsModal from "../forms/auth/SessionsModal";
import NotifyPrefsModal from "../forms/comms/NotifyPrefsModal";
import { useApp } from "../context/AppContext";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [tfaOpen, setTfaOpen] = useState(false);
  const [sessOpen, setSessOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { showToast } = useApp();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <>
      <div style={{ position: "relative" }} ref={ref}>
        <div className="avatar" title="Profile" onClick={() => setOpen((v) => !v)} style={{ userSelect: "none" }}>
          RB
        </div>
        {open ? (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 40,
              background: "#fff",
              border: "1px solid var(--slate-200)",
              borderRadius: 10,
              boxShadow: "var(--shadow-lg)",
              minWidth: 220,
              padding: 6,
              zIndex: 900,
            }}
          >
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid var(--slate-100)",
                marginBottom: 4,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--slate-900)" }}>Phan Dũng</div>
              <div style={{ fontSize: 11, color: "var(--slate-500)" }}>ceo@reborn.vn</div>
            </div>
            {[
              { label: "Hồ sơ cá nhân", fn: () => setProfileOpen(true) },
              { label: "Đổi mật khẩu", fn: () => setPwOpen(true) },
              { label: "Bật 2FA", fn: () => setTfaOpen(true) },
              { label: "Thiết bị đăng nhập", fn: () => setSessOpen(true) },
              { label: "Tùy chọn thông báo", fn: () => setNotifyOpen(true) },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => run(item.fn)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "7px 12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  borderRadius: 6,
                  color: "var(--slate-700)",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--slate-50)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {item.label}
              </button>
            ))}
            <div style={{ borderTop: "1px solid var(--slate-100)", marginTop: 4, paddingTop: 4 }}>
              <button
                type="button"
                onClick={() =>
                  run(() => {
                    showToast("info", "Đã đăng xuất");
                    navigate("/login");
                  })
                }
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "7px 12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  borderRadius: 6,
                  color: "var(--rose-500)",
                  fontFamily: "inherit",
                }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
      <TwoFactorModal open={tfaOpen} onClose={() => setTfaOpen(false)} />
      <SessionsModal open={sessOpen} onClose={() => setSessOpen(false)} />
      <NotifyPrefsModal open={notifyOpen} onClose={() => setNotifyOpen(false)} />
    </>
  );
}
