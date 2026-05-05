// CHUNG: Public-side renderer — hiển thị input cho dynamic fields trên form đăng ký.
import React from "react";
import type { DynamicFieldDefinition } from "../types";
import { THEME, formatVND } from "../shared";

interface Props {
  fields: DynamicFieldDefinition[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

/** Tính tổng tiền các option có giá đã được chọn. Dùng chung cho:
 *  - Hiển thị "+100k" inline khi tick
 *  - Tính grandTotal trên ShareEventPage
 */
export function computeDynamicFieldsTotal(
  fields: DynamicFieldDefinition[] | undefined,
  values: Record<string, string> | undefined,
): number {
  if (!fields?.length || !values) return 0;
  let sum = 0;
  for (const f of fields) {
    const v = values[f.id];
    if (!v) continue;
    if (f.type === "checkbox" && v === "true" && (f.price ?? 0) > 0) {
      sum += f.price!;
    } else if (f.type === "select" && f.optionPrices && f.optionPrices[v]) {
      sum += f.optionPrices[v];
    }
  }
  return sum;
}

export default function DynamicFieldsRenderer({ fields, values, onChange }: Props) {
  if (!fields.length) return null;

  const sorted = [...fields].sort((a, b) => a.order - b.order);

  const update = (id: string, val: string) => {
    onChange({ ...values, [id]: val });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {sorted.map((f) => {
        const val = values[f.id] ?? f.defaultValue ?? "";
        const fullWidth = f.type === "textarea";

        return (
          <div
            key={f.id}
            style={fullWidth ? { gridColumn: "1 / -1" } : undefined}
          >
            <label style={labelStyle}>
              {f.label}
              {f.required && <span style={{ color: THEME.danger }}> *</span>}
              {f.type === "checkbox" && (f.price ?? 0) > 0 && (
                <span style={{ color: THEME.primary, marginLeft: 6, fontWeight: 700 }}>
                  +{formatVND(f.price!)}đ
                </span>
              )}
            </label>

            {f.type === "textarea" ? (
              <textarea
                value={val}
                onChange={(e) => update(f.id, e.target.value)}
                placeholder={f.placeholder}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            ) : f.type === "select" ? (
              (() => {
                const opts = f.options ?? [];
                if (opts.length === 0) {
                  return (
                    <>
                      <select
                        value=""
                        disabled
                        style={{ ...inputStyle, background: "#FEF2F2", borderColor: "#FCA5A5", color: "#991B1B", cursor: "not-allowed" }}
                      >
                        <option value="">— Chưa có tuỳ chọn —</option>
                      </select>
                      <div style={{ fontSize: 11, color: "#B91C1C", marginTop: 4 }}>
                        Trường này chưa được cấu hình. Vui lòng liên hệ BTC.
                      </div>
                    </>
                  );
                }
                return (
                  <select
                    value={val}
                    onChange={(e) => update(f.id, e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">-- Chọn --</option>
                    {opts.map((opt) => {
                      const p = f.optionPrices?.[opt];
                      return (
                        <option key={opt} value={opt}>
                          {p && p > 0 ? `${opt} (+${formatVND(p)}đ)` : opt}
                        </option>
                      );
                    })}
                  </select>
                );
              })()
            ) : f.type === "checkbox" ? (
              <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="checkbox"
                  checked={val === "true"}
                  onChange={(e) => update(f.id, e.target.checked ? "true" : "false")}
                />
                {f.placeholder || f.label}
              </label>
            ) : (
              <input
                type={
                  f.type === "number" ? "number"
                    : f.type === "date" ? "date"
                    : f.type === "email" ? "email"
                    : f.type === "phone" ? "tel"
                    : "text"
                }
                value={val}
                onChange={(e) => update(f.id, e.target.value)}
                placeholder={f.placeholder}
                style={inputStyle}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 4,
  color: "#333",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #D9E0DE",
  borderRadius: 6,
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};
