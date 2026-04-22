// CHUNG: Admin builder — cấu hình trường tùy biến trên form đăng ký.
import React from "react";
import type { DynamicFieldDefinition, DynamicFieldType } from "../types";
import { THEME } from "../shared";

const FIELD_TYPES: { value: DynamicFieldType; label: string }[] = [
  { value: "text", label: "Văn bản" },
  { value: "textarea", label: "Văn bản dài" },
  { value: "number", label: "Số" },
  { value: "select", label: "Chọn 1" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Ngày" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Số điện thoại" },
];

interface Props {
  fields: DynamicFieldDefinition[];
  onChange: (fields: DynamicFieldDefinition[]) => void;
}

export default function DynamicFieldsBuilder({ fields, onChange }: Props) {
  const addField = () => {
    const next: DynamicFieldDefinition = {
      id: `df-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      label: "",
      type: "text",
      required: false,
      order: fields.length,
    };
    onChange([...fields, next]);
  };

  const updateField = (idx: number, patch: Partial<DynamicFieldDefinition>) => {
    const copy = fields.map((f, i) => (i === idx ? { ...f, ...patch } : f));
    onChange(copy);
  };

  const removeField = (idx: number) => {
    onChange(fields.filter((_, i) => i !== idx).map((f, i) => ({ ...f, order: i })));
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= fields.length) return;
    const copy = [...fields];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    onChange(copy.map((f, i) => ({ ...f, order: i })));
  };

  return (
    <div>
      {fields.length === 0 && (
        <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 8px" }}>
          Chưa có trường tùy biến. Thêm trường để người đăng ký điền thêm thông tin.
        </p>
      )}

      {fields.map((f, idx) => (
        <div
          key={f.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px auto auto auto auto",
            gap: 6,
            alignItems: "center",
            marginBottom: 6,
            padding: 8,
            background: THEME.bg,
            borderRadius: 6,
            border: `1px solid ${THEME.border}`,
          }}
        >
          {/* Label */}
          <input
            value={f.label}
            onChange={(e) => updateField(idx, { label: e.target.value })}
            placeholder="Tên trường (VD: Size áo)"
            style={inputStyle}
          />

          {/* Type */}
          <select
            value={f.type}
            onChange={(e) =>
              updateField(idx, { type: e.target.value as DynamicFieldType })
            }
            style={inputStyle}
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Required toggle */}
          <label style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
            <input
              type="checkbox"
              checked={f.required}
              onChange={(e) => updateField(idx, { required: e.target.checked })}
            />
            Bắt buộc
          </label>

          {/* Move up/down */}
          <button
            onClick={() => moveField(idx, -1)}
            disabled={idx === 0}
            style={smallBtn}
            title="Di chuyển lên"
          >
            ↑
          </button>
          <button
            onClick={() => moveField(idx, 1)}
            disabled={idx === fields.length - 1}
            style={smallBtn}
            title="Di chuyển xuống"
          >
            ↓
          </button>

          {/* Remove */}
          <button
            onClick={() => removeField(idx)}
            style={{ ...smallBtn, color: THEME.danger }}
            title="Xoá trường"
          >
            ✕
          </button>

          {/* Options row for select type */}
          {f.type === "select" && (() => {
            const hasOptions = (f.options ?? []).length > 0;
            return (
              <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
                <input
                  value={(f.options ?? []).join(", ")}
                  onChange={(e) =>
                    updateField(idx, {
                      options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Các lựa chọn, cách nhau bởi dấu phẩy (VD: S, M, L, XL)"
                  style={{
                    ...inputStyle,
                    width: "100%",
                    borderColor: hasOptions ? inputStyle.border?.toString().split(" ").pop() : "#DC2626",
                    background: hasOptions ? undefined : "#FEF2F2",
                  }}
                />
                {!hasOptions && (
                  <div style={{ fontSize: 11, color: "#B91C1C", marginTop: 4, fontWeight: 500 }}>
                    ⚠ Bắt buộc: select phải có ít nhất 1 tuỳ chọn — nếu không người đăng ký sẽ không chọn được gì
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ))}

      <button
        onClick={addField}
        style={{
          padding: "8px 14px",
          background: THEME.primarySoft,
          color: THEME.primaryDark,
          border: `1px dashed ${THEME.primary}`,
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        + Thêm trường
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "6px 8px",
  border: `1px solid ${THEME.border}`,
  borderRadius: 4,
  fontSize: 12,
  outline: "none",
};

const smallBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  border: `1px solid ${THEME.border}`,
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
