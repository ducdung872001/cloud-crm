// CHUNG: Public-side renderer — hiển thị input cho dynamic fields trên form đăng ký.
import React from "react";
import type { DynamicFieldDefinition } from "../types";
import { THEME } from "../shared";

interface Props {
  fields: DynamicFieldDefinition[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
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
                    {opts.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
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
