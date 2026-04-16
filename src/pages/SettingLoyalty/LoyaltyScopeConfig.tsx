// Cấu hình phạm vi áp dụng Loyalty — per brand / per store group / toàn chuỗi
import React, { useEffect, useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import LoyaltyService from "services/LoyaltyService";

type ScopeType = "chain_wide" | "per_brand" | "per_store_group";

interface ScopeConfig {
  loyaltyScope: ScopeType;
  crossBrandPoints: boolean; // Điểm dùng chung giữa brand?
  scopeNote: string;
}

const DEFAULT: ScopeConfig = {
  loyaltyScope: "chain_wide",
  crossBrandPoints: true,
  scopeNote: "",
};

// Mock — BE sẽ trả danh sách brand/store group từ tenant config
const MOCK_BRANDS = [
  { id: 1, name: "Brand A — Siêu thị lớn", storeCount: 180 },
  { id: 2, name: "Brand B — Cửa hàng tiện lợi", storeCount: 120 },
];

const MOCK_STORE_GROUPS = [
  { id: 1, name: "Miền Bắc", storeCount: 95 },
  { id: 2, name: "Miền Trung", storeCount: 65 },
  { id: 3, name: "Miền Nam", storeCount: 140 },
];

interface Props {
  onBackProps?: (v: boolean) => void;
}

export default function LoyaltyScopeConfig({ onBackProps }: Props) {
  const [config, setConfig] = useState<ScopeConfig>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await LoyaltyService.getLoyaltyConfig();
        if (res?.result?.loyaltyScope) {
          setConfig({
            loyaltyScope: res.result.loyaltyScope,
            crossBrandPoints: res.result.crossBrandPoints ?? true,
            scopeNote: res.result.scopeNote ?? "",
          });
        }
      } catch { /* use defaults */ }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await LoyaltyService.updateLoyaltyConfig(config as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert("Lưu thất bại"); }
    setSaving(false);
  };

  const scopeOptions: { value: ScopeType; label: string; desc: string; icon: string }[] = [
    { value: "chain_wide", label: "Toàn chuỗi", desc: "Loyalty chung cho tất cả cửa hàng, mọi brand", icon: "🏬" },
    { value: "per_brand", label: "Theo thương hiệu", desc: "Mỗi brand có chương trình loyalty riêng", icon: "🏷️" },
    { value: "per_store_group", label: "Theo nhóm cửa hàng", desc: "Loyalty riêng theo vùng miền / nhóm CH", icon: "📍" },
  ];

  return (
    <div>
      <HeaderTabMenu title="Phạm vi áp dụng Loyalty" titleBack="Cấu hình Loyalty" onBackProps={onBackProps} />

      <div style={{ padding: 20, maxWidth: 700 }}>
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, color: "#0B2E2A" }}>
            Chương trình Loyalty áp dụng cho
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {scopeOptions.map((opt) => (
              <label
                key={opt.value}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                  borderRadius: 10, cursor: "pointer",
                  border: `2px solid ${config.loyaltyScope === opt.value ? "#00C9A7" : "#D9E0DE"}`,
                  background: config.loyaltyScope === opt.value ? "#E4F7F3" : "#fff",
                }}
              >
                <input
                  type="radio"
                  name="scope"
                  checked={config.loyaltyScope === opt.value}
                  onChange={() => setConfig({ ...config, loyaltyScope: opt.value })}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontSize: 22 }}>{opt.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0B2E2A" }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: "#6B8A85" }}>{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Per-brand details */}
          {config.loyaltyScope === "per_brand" && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 13, color: "#0B2E2A", margin: "0 0 10px" }}>Danh sách thương hiệu</h4>
              {MOCK_BRANDS.map((b) => (
                <div key={b.id} style={itemRowStyle}>
                  <span style={{ fontWeight: 600, color: "#0B2E2A" }}>{b.name}</span>
                  <span style={{ fontSize: 11, color: "#6B8A85" }}>{b.storeCount} cửa hàng</span>
                </div>
              ))}
              <label style={{ ...checkboxStyle, marginTop: 12 }}>
                <input
                  type="checkbox"
                  checked={config.crossBrandPoints}
                  onChange={(e) => setConfig({ ...config, crossBrandPoints: e.target.checked })}
                />
                <span>Cho phép điểm dùng chéo giữa các brand</span>
              </label>
              {config.crossBrandPoints && (
                <p style={{ fontSize: 11, color: "#6B8A85", margin: "4px 0 0 28px" }}>
                  Khách tích điểm ở Brand A có thể đổi thưởng ở Brand B và ngược lại
                </p>
              )}
            </div>
          )}

          {/* Per-store-group details */}
          {config.loyaltyScope === "per_store_group" && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 13, color: "#0B2E2A", margin: "0 0 10px" }}>Nhóm cửa hàng</h4>
              {MOCK_STORE_GROUPS.map((g) => (
                <div key={g.id} style={itemRowStyle}>
                  <span style={{ fontWeight: 600, color: "#0B2E2A" }}>{g.name}</span>
                  <span style={{ fontSize: 11, color: "#6B8A85" }}>{g.storeCount} cửa hàng</span>
                </div>
              ))}
            </div>
          )}

          {/* Note */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Ghi chú nội bộ</label>
            <textarea
              value={config.scopeNote}
              onChange={(e) => setConfig({ ...config, scopeNote: e.target.value })}
              placeholder="VD: Áp dụng từ Q2/2026, phase 1 chỉ toàn chuỗi..."
              rows={2}
              style={{ ...inputStyle, width: "100%", resize: "vertical" }}
            />
          </div>

          {/* Preview */}
          <div style={previewStyle}>
            {config.loyaltyScope === "chain_wide" && "Tất cả cửa hàng dùng chung 1 chương trình Loyalty. Khách tích/đổi điểm ở bất kỳ CH nào."}
            {config.loyaltyScope === "per_brand" && `Mỗi brand (${MOCK_BRANDS.map(b => b.name.split(" — ")[0]).join(", ")}) có chương trình riêng.${config.crossBrandPoints ? " Điểm dùng chéo cross-brand." : " Điểm KHÔNG dùng chéo."}`}
            {config.loyaltyScope === "per_store_group" && `Loyalty riêng theo ${MOCK_STORE_GROUPS.length} nhóm CH (${MOCK_STORE_GROUPS.map(g => g.name).join(", ")}).`}
          </div>

          <button onClick={handleSave} disabled={saving} style={btnStyle}>
            {saving ? "Đang lưu..." : saved ? "✓ Đã lưu" : "💾 Lưu cấu hình"}
          </button>
        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #D9E0DE" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#0B2E2A", marginBottom: 6 };
const inputStyle: React.CSSProperties = { padding: "8px 12px", border: "1px solid #D9E0DE", borderRadius: 6, fontSize: 13 };
const checkboxStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" };
const itemRowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#F5F9F8", borderRadius: 8, marginBottom: 6 };
const previewStyle: React.CSSProperties = { marginTop: 16, padding: "12px 16px", background: "#E4F7F3", borderRadius: 8, fontSize: 13, color: "#0B2E2A", lineHeight: 1.5, borderLeft: "4px solid #00C9A7" };
const btnStyle: React.CSSProperties = { marginTop: 16, padding: "10px 24px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" };
