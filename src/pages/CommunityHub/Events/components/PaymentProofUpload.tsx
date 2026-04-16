// CHUNG: Public-side — upload ảnh hoá đơn chuyển khoản.
import React, { useRef } from "react";
import { THEME } from "../shared";

interface Props {
  imageUrl: string | null;
  onChange: (dataUrl: string | null) => void;
}

export default function PaymentProofUpload({ imageUrl, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        border: `1px dashed ${imageUrl ? THEME.success : THEME.border}`,
        borderRadius: 8,
        padding: 14,
        background: imageUrl ? "#F0FFF4" : THEME.bg,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: THEME.textMain }}>
        Upload bằng chứng chuyển khoản
      </div>

      {imageUrl ? (
        <div>
          <img
            src={imageUrl}
            alt="Bằng chứng thanh toán"
            style={{
              maxWidth: "100%",
              maxHeight: 300,
              borderRadius: 6,
              border: `1px solid ${THEME.border}`,
            }}
          />
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={actionBtn}
            >
              Chọn ảnh khác
            </button>
            <button
              onClick={() => onChange(null)}
              style={{ ...actionBtn, color: THEME.danger, borderColor: THEME.danger }}
            >
              Xoá
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            padding: "24px 0",
            textAlign: "center",
            cursor: "pointer",
            color: THEME.textMuted,
            fontSize: 12,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 6 }}>+</div>
          Chọn ảnh hoá đơn / screenshot chuyển khoản
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />

      <p style={{ fontSize: 11, color: THEME.textMuted, margin: "8px 0 0" }}>
        Hỗ trợ JPG, PNG. Ảnh sẽ được gửi kèm đăng ký để BTC xác nhận thanh toán.
      </p>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: 12,
  border: "1px solid #D9E0DE",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
};
