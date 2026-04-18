import { useState } from "react";
import { Modal, Field, Input } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TwoFactorModal({ open, onClose }: Props) {
  const [step, setStep] = useState<"qr" | "verify" | "backup">("qr");
  const [code, setCode] = useState("");
  const { submitting, submit } = useFormStub("Đã bật 2FA", "Lần sau cần mã OTP khi đăng nhập");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bật xác thực 2 bước"
      kicker="SECURITY · 2FA"
      footer={
        step === "backup" ? (
          <>
            <button type="button" className="btn" onClick={onClose}>
              Đóng
            </button>
            <button type="button" className="btn primary" onClick={onClose}>
              Đã lưu backup code
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn" onClick={onClose}>
              Hủy
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={step === "verify" ? code.length !== 6 || submitting : false}
              onClick={() => {
                if (step === "qr") setStep("verify");
                else if (step === "verify") submit(() => setStep("backup"));
              }}
            >
              {step === "qr" ? "Tiếp tục →" : "Xác nhận"}
            </button>
          </>
        )
      }
    >
      {step === "qr" ? (
        <>
          <p style={{ fontSize: 13, color: "var(--slate-600)", marginBottom: 14 }}>
            Dùng Google Authenticator / Authy / 1Password để quét QR bên dưới.
          </p>
          <div
            style={{
              padding: 14,
              border: "1px solid var(--slate-200)",
              borderRadius: 10,
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 18,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 140,
                height: 140,
                background: "#000",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
              }}
            >
              QR placeholder
            </div>
            <div>
              <div className="field-help">Hoặc nhập mã thủ công:</div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "var(--slate-100)",
                  padding: "6px 10px",
                  borderRadius: 6,
                  marginTop: 4,
                  letterSpacing: "0.12em",
                }}
              >
                JBSW Y3DP EHPK 3PXP
              </div>
            </div>
          </div>
        </>
      ) : step === "verify" ? (
        <Field label="Nhập mã 6 số từ app" required>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            autoFocus
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.3em", textAlign: "center", fontSize: 20 }}
          />
        </Field>
      ) : (
        <>
          <p style={{ fontSize: 13, color: "var(--slate-600)", marginBottom: 12 }}>
            Lưu backup codes này ở nơi an toàn — mỗi code dùng 1 lần nếu mất điện thoại.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              padding: 14,
              background: "var(--slate-50)",
              borderRadius: 8,
            }}
          >
            {["a1b2-c3d4", "e5f6-g7h8", "i9j0-k1l2", "m3n4-o5p6", "q7r8-s9t0", "u1v2-w3x4", "y5z6-a7b8", "c9d0-e1f2"].map((c) => (
              <div key={c}>{c}</div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
