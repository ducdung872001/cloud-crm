import { useState } from "react";
import { Modal, Field, FieldRow, Input } from "../../components/ui";
import { useApp } from "../../context/AppContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PRESETS = [
  { name: "iPhone 15 Pro", w: 393, h: 852, ico: "📱" },
  { name: "iPhone SE", w: 375, h: 667, ico: "📱" },
  { name: "Pixel 8", w: 412, h: 915, ico: "📱" },
  { name: "iPad Mini", w: 744, h: 1133, ico: "💻" },
  { name: "iPad Pro 11", w: 834, h: 1194, ico: "💻" },
  { name: "MacBook 14", w: 1512, h: 982, ico: "🖥️" },
  { name: "Desktop 1440p", w: 1440, h: 900, ico: "🖥️" },
  { name: "Desktop 4K", w: 1920, h: 1080, ico: "🖥️" },
];

export default function DevicePresetModal({ open, onClose }: Props) {
  const { showToast } = useApp();
  const [selected, setSelected] = useState("MacBook 14");
  const [customW, setCustomW] = useState("1440");
  const [customH, setCustomH] = useState("900");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chọn kích thước viewport"
      kicker="STAGE 3 · DEVICE"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              showToast("info", `Viewport: ${selected}`, `${customW}×${customH}`);
              onClose();
            }}
          >
            Áp dụng
          </button>
        </>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => {
              setSelected(p.name);
              setCustomW(String(p.w));
              setCustomH(String(p.h));
            }}
            style={{
              padding: 12,
              border: `2px solid ${selected === p.name ? "var(--teal-500)" : "var(--slate-200)"}`,
              background: selected === p.name ? "rgba(20,184,166,0.05)" : "#fff",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{p.ico}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--slate-500)",
              }}
            >
              {p.w} × {p.h}
            </div>
          </button>
        ))}
      </div>

      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Hoặc tùy chỉnh</div>
      <FieldRow>
        <Field label="Width (px)">
          <Input type="number" value={customW} onChange={(e) => setCustomW(e.target.value)} />
        </Field>
        <Field label="Height (px)">
          <Input type="number" value={customH} onChange={(e) => setCustomH(e.target.value)} />
        </Field>
      </FieldRow>
    </Modal>
  );
}
