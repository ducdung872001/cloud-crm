// Cấu hình hạn sử dụng điểm — loyalty config mở rộng cho siêu thị
import React, { useEffect, useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import LoyaltyService from "services/LoyaltyService";

type ExpiryType = "never" | "after_months" | "end_of_year";

interface ExpiryConfig {
  expiryType: ExpiryType;
  expiryMonths: number;
  expiryAnnualDate: string; // MM-DD
  notifyBeforeDays: number;
}

const DEFAULT: ExpiryConfig = {
  expiryType: "never",
  expiryMonths: 12,
  expiryAnnualDate: "12-31",
  notifyBeforeDays: 30,
};

interface Props {
  onBackProps?: (v: boolean) => void;
}

export default function PointExpiryConfig({ onBackProps }: Props) {
  const [config, setConfig] = useState<ExpiryConfig>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await LoyaltyService.getLoyaltyConfig();
        if (res?.result) {
          setConfig({
            expiryType: res.result.expiryType ?? "never",
            expiryMonths: res.result.expiryMonths ?? 12,
            expiryAnnualDate: res.result.expiryAnnualDate ?? "12-31",
            notifyBeforeDays: res.result.notifyBeforeDays ?? 30,
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

  const previewExpiry = () => {
    const today = new Date();
    if (config.expiryType === "never") return "Điểm không hết hạn";
    if (config.expiryType === "after_months") {
      const exp = new Date(today);
      exp.setMonth(exp.getMonth() + config.expiryMonths);
      return `Điểm tích hôm nay sẽ hết hạn vào ${exp.toLocaleDateString("vi-VN")} (sau ${config.expiryMonths} tháng)`;
    }
    const [mm, dd] = config.expiryAnnualDate.split("-");
    return `Điểm tích trong năm nay sẽ hết hạn vào ${dd}/${mm} hàng năm`;
  };

  return (
    <div>
      <HeaderTabMenu title="Hạn sử dụng điểm" titleBack="Cấu hình Loyalty" onBackProps={onBackProps} />

      <div style={{ padding: 20 }}>
        <div style={cardStyle}>
          <h3 style={headingStyle}>Kiểu hết hạn điểm</h3>

          {(["never", "after_months", "end_of_year"] as ExpiryType[]).map((type) => (
            <label key={type} style={radioStyle}>
              <input
                type="radio"
                name="expiryType"
                checked={config.expiryType === type}
                onChange={() => setConfig({ ...config, expiryType: type })}
              />
              <span style={{ fontWeight: 600 }}>
                {type === "never" && "Không hết hạn"}
                {type === "after_months" && "Hết hạn sau X tháng kể từ ngày tích"}
                {type === "end_of_year" && "Hết hạn vào ngày cố định hàng năm"}
              </span>
            </label>
          ))}

          {config.expiryType === "after_months" && (
            <div style={{ marginTop: 12, marginLeft: 28 }}>
              <label style={labelStyle}>Số tháng hiệu lực</label>
              <input
                type="number"
                min={1}
                max={60}
                value={config.expiryMonths}
                onChange={(e) => setConfig({ ...config, expiryMonths: +e.target.value })}
                style={inputStyle}
              />
            </div>
          )}

          {config.expiryType === "end_of_year" && (
            <div style={{ marginTop: 12, marginLeft: 28 }}>
              <label style={labelStyle}>Ngày hết hạn hàng năm (MM-DD)</label>
              <input
                type="text"
                value={config.expiryAnnualDate}
                onChange={(e) => setConfig({ ...config, expiryAnnualDate: e.target.value })}
                placeholder="12-31"
                style={inputStyle}
              />
            </div>
          )}

          {config.expiryType !== "never" && (
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>Thông báo trước khi hết hạn (ngày)</label>
              <input
                type="number"
                min={0}
                max={90}
                value={config.notifyBeforeDays}
                onChange={(e) => setConfig({ ...config, notifyBeforeDays: +e.target.value })}
                style={inputStyle}
              />
            </div>
          )}

          {/* Preview */}
          <div style={previewStyle}>
            {previewExpiry()}
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
const headingStyle: React.CSSProperties = { margin: "0 0 16px", fontSize: 15, color: "#0B2E2A" };
const radioStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 13, cursor: "pointer" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#0B2E2A", marginBottom: 4 };
const inputStyle: React.CSSProperties = { padding: "8px 12px", border: "1px solid #D9E0DE", borderRadius: 6, fontSize: 13, width: 200 };
const previewStyle: React.CSSProperties = { marginTop: 16, padding: "12px 16px", background: "#E4F7F3", borderRadius: 8, fontSize: 13, color: "#0B2E2A", fontWeight: 500, borderLeft: "4px solid #00C9A7" };
const btnStyle: React.CSSProperties = { marginTop: 16, padding: "10px 24px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" };
