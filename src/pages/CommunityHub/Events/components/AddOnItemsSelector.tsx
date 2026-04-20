// CHUNG: Public-side — chọn sản phẩm/dịch vụ bổ sung + tính tổng tiền.
import React from "react";
import type { EventAddOnItem, SelectedAddOn } from "../types";
import { THEME, formatVND } from "../shared";

interface Props {
  items: EventAddOnItem[];
  selected: SelectedAddOn[];
  onChange: (selected: SelectedAddOn[]) => void;
}

export default function AddOnItemsSelector({ items, selected, onChange }: Props) {
  if (!items.length) return null;

  const getQty = (id: string) => selected.find((s) => s.addOnId === id)?.qty ?? 0;

  const setQty = (id: string, qty: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const max = item.maxQty ?? 99;
    const clamped = Math.max(0, Math.min(qty, max));
    const next = selected.filter((s) => s.addOnId !== id);
    if (clamped > 0) next.push({ addOnId: id, qty: clamped });
    onChange(next);
  };

  const subtotal = selected.reduce((sum, s) => {
    const item = items.find((i) => i.id === s.addOnId);
    return sum + (item ? item.unitPrice * s.qty : 0);
  }, 0);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        {items.map((item) => {
          const qty = getQty(item.id);
          const isActive = qty > 0;
          return (
            <div
              key={item.id}
              style={{
                border: `1.5px solid ${isActive ? THEME.primary : THEME.border}`,
                borderRadius: 8,
                padding: 10,
                background: isActive ? THEME.primarySoft : "#fff",
                transition: "all .15s",
              }}
            >
              {item.imageUrl && (
                <div
                  style={{
                    width: "100%",
                    height: 90,
                    borderRadius: 6,
                    backgroundImage: `url(${item.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    marginBottom: 8,
                  }}
                />
              )}
              <div style={{ fontWeight: 600, fontSize: 13, color: THEME.textMain }}>
                {item.name}
              </div>
              {item.description && (
                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                  {item.description}
                </div>
              )}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: THEME.primary,
                  margin: "6px 0",
                }}
              >
                {formatVND(item.unitPrice)} / {item.unit}
              </div>

              {/* Qty stepper */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => setQty(item.id, qty - 1)}
                  disabled={qty === 0}
                  style={stepperBtn}
                >
                  -
                </button>
                <span
                  style={{
                    minWidth: 28,
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty(item.id, qty + 1)}
                  disabled={item.maxQty != null && qty >= item.maxQty}
                  style={stepperBtn}
                >
                  +
                </button>
                {qty > 0 && (
                  <span style={{ fontSize: 12, color: THEME.textMuted, marginLeft: "auto" }}>
                    = {formatVND(item.unitPrice * qty)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {subtotal > 0 && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: THEME.primarySoft,
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            color: THEME.primaryDark,
            textAlign: "right",
          }}
        >
          Tổng add-on: {formatVND(subtotal)} VND
        </div>
      )}
    </div>
  );
}

const stepperBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  border: `1px solid #D9E0DE`,
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
