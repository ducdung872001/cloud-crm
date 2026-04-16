// Cấu hình thăng/hạ hạng tự động — loyalty config mở rộng cho siêu thị
import React, { useEffect, useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import LoyaltyService from "services/LoyaltyService";

type EvalPeriod = "monthly" | "quarterly" | "yearly";
type EvalMetric = "total_spend" | "total_points" | "order_count";

interface TierEvalConfig {
  enabled: boolean;
  evalPeriod: EvalPeriod;
  evalMetric: EvalMetric;
  autoUpgrade: boolean;
  autoDowngrade: boolean;
  downgradeGraceDays: number;
  notifyOnChange: boolean;
}

const DEFAULT: TierEvalConfig = {
  enabled: false,
  evalPeriod: "quarterly",
  evalMetric: "total_spend",
  autoUpgrade: true,
  autoDowngrade: true,
  downgradeGraceDays: 30,
  notifyOnChange: true,
};

interface Props {
  onBackProps?: (v: boolean) => void;
}

export default function AutoTierConfig({ onBackProps }: Props) {
  const [config, setConfig] = useState<TierEvalConfig>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await LoyaltyService.getLoyaltyConfig();
        if (res?.result?.tierEval) {
          setConfig({ ...DEFAULT, ...res.result.tierEval });
        }
      } catch { /* use defaults */ }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await LoyaltyService.updateLoyaltyConfig({ tierEval: config } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert("Lưu thất bại"); }
    setSaving(false);
  };

  const update = <K extends keyof TierEvalConfig>(k: K, v: TierEvalConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v }));

  const periodLabel: Record<EvalPeriod, string> = { monthly: "Hàng tháng", quarterly: "Hàng quý", yearly: "Hàng năm" };
  const metricLabel: Record<EvalMetric, string> = { total_spend: "Tổng chi tiêu (VND)", total_points: "Tổng điểm tích", order_count: "Số đơn hàng" };

  return (
    <div>
      <HeaderTabMenu title="Thăng / hạ hạng tự động" titleBack="Cấu hình Loyalty" onBackProps={onBackProps} />

      <div style={{ padding: 20 }}>
        <div style={cardStyle}>
          {/* Enable toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => update("enabled", e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0B2E2A" }}>
              Bật đánh giá hạng thành viên tự động
            </span>
          </label>

          {config.enabled && (
            <>
              {/* Eval period */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Chu kỳ đánh giá</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(Object.keys(periodLabel) as EvalPeriod[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => update("evalPeriod", p)}
                      style={{
                        padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        background: config.evalPeriod === p ? "#E4F7F3" : "#fff",
                        color: config.evalPeriod === p ? "#0B2E2A" : "#6B8A85",
                        border: `1.5px solid ${config.evalPeriod === p ? "#00C9A7" : "#D9E0DE"}`,
                      }}
                    >
                      {periodLabel[p]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eval metric */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Tiêu chí đánh giá</label>
                <select
                  value={config.evalMetric}
                  onChange={(e) => update("evalMetric", e.target.value as EvalMetric)}
                  style={inputStyle}
                >
                  {(Object.keys(metricLabel) as EvalMetric[]).map((m) => (
                    <option key={m} value={m}>{metricLabel[m]}</option>
                  ))}
                </select>
              </div>

              {/* Auto upgrade/downgrade */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <label style={checkboxStyle}>
                  <input type="checkbox" checked={config.autoUpgrade} onChange={(e) => update("autoUpgrade", e.target.checked)} />
                  <span>Tự động thăng hạng</span>
                </label>
                <label style={checkboxStyle}>
                  <input type="checkbox" checked={config.autoDowngrade} onChange={(e) => update("autoDowngrade", e.target.checked)} />
                  <span>Tự động hạ hạng</span>
                </label>
              </div>

              {config.autoDowngrade && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Ân hạn trước khi hạ hạng (ngày)</label>
                  <input
                    type="number" min={0} max={180}
                    value={config.downgradeGraceDays}
                    onChange={(e) => update("downgradeGraceDays", +e.target.value)}
                    style={inputStyle}
                  />
                  <p style={{ fontSize: 11, color: "#6B8A85", margin: "4px 0 0" }}>
                    Hội viên sẽ nhận cảnh báo trước {config.downgradeGraceDays} ngày để có cơ hội duy trì hạng
                  </p>
                </div>
              )}

              {/* Notify */}
              <label style={checkboxStyle}>
                <input type="checkbox" checked={config.notifyOnChange} onChange={(e) => update("notifyOnChange", e.target.checked)} />
                <span>Gửi thông báo (SMS/Email) khi thay đổi hạng</span>
              </label>

              {/* Preview */}
              <div style={previewStyle}>
                Hệ thống sẽ đánh giá <b>{periodLabel[config.evalPeriod].toLowerCase()}</b> dựa trên <b>{metricLabel[config.evalMetric].toLowerCase()}</b>.
                {config.autoUpgrade && " Tự động thăng hạng nếu đạt ngưỡng."}
                {config.autoDowngrade && ` Hạ hạng sau ${config.downgradeGraceDays} ngày ân hạn nếu không đạt.`}
              </div>
            </>
          )}

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
const inputStyle: React.CSSProperties = { padding: "8px 12px", border: "1px solid #D9E0DE", borderRadius: 6, fontSize: 13, width: 250 };
const checkboxStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" };
const previewStyle: React.CSSProperties = { marginTop: 16, padding: "12px 16px", background: "#E4F7F3", borderRadius: 8, fontSize: 13, color: "#0B2E2A", lineHeight: 1.5, borderLeft: "4px solid #00C9A7" };
const btnStyle: React.CSSProperties = { marginTop: 16, padding: "10px 24px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" };
