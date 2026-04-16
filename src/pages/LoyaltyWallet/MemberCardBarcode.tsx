// Thẻ hội viên ảo với barcode — hiển thị trong modal
import React, { useRef } from "react";

interface Props {
  visible: boolean;
  onClose: () => void;
  member: {
    id?: number;
    customerName?: string;
    phone?: string;
    segmentName?: string;
    currentBalance?: number;
    totalEarn?: number;
  } | null;
}

const TIER_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  "Đồng": { bg: "linear-gradient(135deg, #F5E6D3, #D4A76A)", text: "#5D3A1A", accent: "#CD7F32" },
  "Bạc": { bg: "linear-gradient(135deg, #E8ECF0, #B0BEC5)", text: "#37474F", accent: "#90A4AE" },
  "Vàng": { bg: "linear-gradient(135deg, #FFF8E1, #FFD54F)", text: "#5D4037", accent: "#FFC107" },
  "Kim Cương": { bg: "linear-gradient(135deg, #E8EAF6, #7C8BF5)", text: "#1A237E", accent: "#536DFE" },
  Bronze: { bg: "linear-gradient(135deg, #F5E6D3, #D4A76A)", text: "#5D3A1A", accent: "#CD7F32" },
  Silver: { bg: "linear-gradient(135deg, #E8ECF0, #B0BEC5)", text: "#37474F", accent: "#90A4AE" },
  Gold: { bg: "linear-gradient(135deg, #FFF8E1, #FFD54F)", text: "#5D4037", accent: "#FFC107" },
  Diamond: { bg: "linear-gradient(135deg, #E8EAF6, #7C8BF5)", text: "#1A237E", accent: "#536DFE" },
  Platinum: { bg: "linear-gradient(135deg, #F3E5F5, #CE93D8)", text: "#4A148C", accent: "#9C27B0" },
  VIP: { bg: "linear-gradient(135deg, #FCE4EC, #EF5350)", text: "#B71C1C", accent: "#E53935" },
};

const DEFAULT_COLORS = { bg: "linear-gradient(135deg, #E4F7F3, #00C9A7)", text: "#0B2E2A", accent: "#00C9A7" };

export default function MemberCardBarcode({ visible, onClose, member }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!visible || !member) return null;

  const tier = member.segmentName ?? "Hội viên";
  const colors = TIER_COLORS[tier] ?? DEFAULT_COLORS;
  const barcodeValue = member.phone ?? String(member.id ?? "000000");

  const handlePrint = () => {
    const content = cardRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=500,height=350");
    if (!win) return;
    win.document.write(`<html><head><title>Thẻ hội viên</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5;}@media print{body{background:#fff;}}</style></head><body>${content.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, width: "90%" }}>
        {/* Card */}
        <div
          ref={cardRef}
          style={{
            background: colors.bg,
            borderRadius: 16,
            padding: "28px 24px",
            color: colors.text,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}
        >
          {/* Logo / Brand */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>
                Membership Card
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>
                Reborn Loyalty
              </div>
            </div>
            <div style={{
              padding: "6px 14px", borderRadius: 20,
              background: "rgba(255,255,255,0.3)", backdropFilter: "blur(4px)",
              fontSize: 12, fontWeight: 700, textTransform: "uppercase",
              border: `1.5px solid ${colors.accent}`,
            }}>
              {tier}
            </div>
          </div>

          {/* Member info */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.5 }}>
              {member.customerName ?? "—"}
            </div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
              {member.phone ?? "—"}
            </div>
          </div>

          {/* Points */}
          <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.7, textTransform: "uppercase" }}>Điểm hiện tại</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {(member.currentBalance ?? 0).toLocaleString("vi-VN")}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.7, textTransform: "uppercase" }}>Tổng tích lũy</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {(member.totalEarn ?? 0).toLocaleString("vi-VN")}
              </div>
            </div>
          </div>

          {/* Barcode (CSS simulated) */}
          <div style={{
            background: "#fff", borderRadius: 8, padding: "12px 16px",
            textAlign: "center",
          }}>
            {/* Simple barcode simulation using CSS */}
            <div style={{ display: "flex", justifyContent: "center", gap: 1, height: 40, marginBottom: 6 }}>
              {barcodeValue.split("").map((ch, i) => {
                const w = ((ch.charCodeAt(0) % 3) + 1);
                return (
                  <React.Fragment key={i}>
                    <div style={{ width: w, background: "#000", height: "100%" }} />
                    <div style={{ width: ((ch.charCodeAt(0) % 2) + 1), background: "#fff", height: "100%" }} />
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#333", letterSpacing: 3, fontFamily: "monospace" }}>
              {barcodeValue}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
          <button onClick={handlePrint} style={actionBtn("#00C9A7")}>
            🖨️ In thẻ
          </button>
          <button onClick={onClose} style={actionBtn("#6B8A85")}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function actionBtn(bg: string): React.CSSProperties {
  return {
    padding: "10px 20px", background: bg, color: "#fff",
    border: "none", borderRadius: 8, fontWeight: 700,
    fontSize: 13, cursor: "pointer",
  };
}
