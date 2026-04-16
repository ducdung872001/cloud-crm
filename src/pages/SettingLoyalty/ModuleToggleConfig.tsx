// Cấu hình bật/tắt các phân hệ — cho phép khách chỉ dùng Loyalty thuần
import React, { useEffect, useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

export const MODULE_TOGGLE_KEY = "reborn.module_toggles";

export interface ModuleToggles {
  sales: boolean; // Bán hàng
  warehouse: boolean; // Hàng hóa & Kho
  customer: boolean; // Khách hàng & Đối tác
  finance: boolean; // Tài chính & Thanh toán
  loyalty: boolean; // Loyalty (luôn bật)
  marketing: boolean; // Tiếp thị & Chăm sóc
  report: boolean; // Hệ thống báo cáo
  bpm: boolean; // Quản lý quy trình
  settings: boolean; // Cài đặt
}

const DEFAULT_TOGGLES: ModuleToggles = {
  sales: true,
  warehouse: true,
  customer: true,
  finance: true,
  loyalty: true,
  marketing: true,
  report: true,
  bpm: true,
  settings: true,
};

// Preset modes
const PRESETS: { key: string; label: string; desc: string; toggles: ModuleToggles }[] = [
  {
    key: "full",
    label: "Đầy đủ",
    desc: "Bật tất cả phân hệ — phù hợp doanh nghiệp tự vận hành bán hàng + loyalty",
    toggles: { ...DEFAULT_TOGGLES },
  },
  {
    key: "loyalty_only",
    label: "Loyalty thuần",
    desc: "Chỉ bật Loyalty + Cài đặt — phù hợp khách đã có POS riêng, chỉ cần tích hợp loyalty",
    toggles: {
      sales: false, warehouse: false, customer: false, finance: false,
      loyalty: true, marketing: false, report: false, bpm: false, settings: true,
    },
  },
  {
    key: "loyalty_marketing",
    label: "Loyalty + Marketing",
    desc: "Loyalty + Tiếp thị + Khách hàng + Báo cáo — phù hợp team marketing quản lý hội viên",
    toggles: {
      sales: false, warehouse: false, customer: true, finance: false,
      loyalty: true, marketing: true, report: true, bpm: false, settings: true,
    },
  },
];

const MODULES: { key: keyof ModuleToggles; label: string; icon: string; locked?: boolean }[] = [
  { key: "sales", label: "Bán hàng", icon: "🛒" },
  { key: "warehouse", label: "Hàng hóa & Kho", icon: "📦" },
  { key: "customer", label: "Khách hàng & Đối tác", icon: "👥" },
  { key: "finance", label: "Tài chính & Thanh toán", icon: "💰" },
  { key: "loyalty", label: "Loyalty", icon: "⭐", locked: true },
  { key: "marketing", label: "Tiếp thị & Chăm sóc", icon: "📣" },
  { key: "report", label: "Hệ thống báo cáo", icon: "📊" },
  { key: "bpm", label: "Quản lý quy trình", icon: "⚙️" },
  { key: "settings", label: "Cài đặt", icon: "🔧", locked: true },
];

export function getModuleToggles(): ModuleToggles {
  try {
    const raw = localStorage.getItem(MODULE_TOGGLE_KEY);
    if (raw) return { ...DEFAULT_TOGGLES, ...JSON.parse(raw) };
  } catch { /* */ }
  return DEFAULT_TOGGLES;
}

interface Props {
  onBackProps?: (v: boolean) => void;
}

export default function ModuleToggleConfig({ onBackProps }: Props) {
  const [toggles, setToggles] = useState<ModuleToggles>(DEFAULT_TOGGLES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setToggles(getModuleToggles());
  }, []);

  const handleToggle = (key: keyof ModuleToggles) => {
    if (key === "loyalty" || key === "settings") return; // locked
    setToggles((t) => ({ ...t, [key]: !t[key] }));
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setToggles(preset.toggles);
  };

  const handleSave = () => {
    localStorage.setItem(MODULE_TOGGLE_KEY, JSON.stringify(toggles));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Trigger reload để menu sidebar cập nhật
    window.dispatchEvent(new Event("module-toggles-changed"));
  };

  const enabledCount = Object.values(toggles).filter(Boolean).length;

  return (
    <div>
      <HeaderTabMenu title="Chế độ hiển thị" titleBack="Cấu hình Loyalty" onBackProps={onBackProps} />

      <div style={{ padding: 20 }}>
        {/* Presets */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 14, color: "#0B2E2A" }}>Chế độ nhanh</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {PRESETS.map((p) => {
              const isActive = JSON.stringify(toggles) === JSON.stringify(p.toggles);
              return (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p)}
                  style={{
                    padding: 16, borderRadius: 10, textAlign: "left", cursor: "pointer",
                    border: `2px solid ${isActive ? "#00C9A7" : "#D9E0DE"}`,
                    background: isActive ? "#E4F7F3" : "#fff",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0B2E2A", marginBottom: 4 }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: "#6B8A85", lineHeight: 1.4 }}>{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Module toggles */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #D9E0DE", padding: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, color: "#0B2E2A" }}>
            Phân hệ ({enabledCount}/{MODULES.length} bật)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MODULES.map((m) => {
              const on = toggles[m.key];
              return (
                <div
                  key={m.key}
                  onClick={() => handleToggle(m.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", borderRadius: 8, cursor: m.locked ? "default" : "pointer",
                    background: on ? "#F0FFF4" : "#F9FAFB",
                    border: `1px solid ${on ? "#22C55E" : "#D9E0DE"}`,
                    opacity: m.locked ? 0.7 : 1,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#0B2E2A" }}>{m.label}</span>
                  {m.locked ? (
                    <span style={{ fontSize: 11, color: "#6B8A85", background: "#F3F4F6", padding: "2px 8px", borderRadius: 10 }}>Luôn bật</span>
                  ) : (
                    <div
                      style={{
                        width: 44, height: 24, borderRadius: 12, padding: 2,
                        background: on ? "#22C55E" : "#D1D5DB",
                        transition: "background 0.2s",
                        display: "flex", alignItems: "center",
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%", background: "#fff",
                        transition: "transform 0.2s",
                        transform: on ? "translateX(20px)" : "translateX(0)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={handleSave} style={{
            marginTop: 16, padding: "10px 24px", background: "#00C9A7", color: "#fff",
            border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>
            {saved ? "✓ Đã lưu — reload trang để cập nhật menu" : "💾 Lưu & Áp dụng"}
          </button>
        </div>

        <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFFBEB", borderLeft: "4px solid #F5A623", borderRadius: 6, fontSize: 12, color: "#92400E", lineHeight: 1.5 }}>
          <b>Lưu ý:</b> Tắt phân hệ chỉ ẩn khỏi menu sidebar. Dữ liệu không bị xoá. Bật lại bất kỳ lúc nào.
          Sau khi lưu, <b>reload trang</b> (F5) để menu sidebar cập nhật.
        </div>
      </div>
    </div>
  );
}
