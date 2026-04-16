// ĐẶC THÙ: Admin-side — chọn dịch vụ từ Service Catalog làm add-on cho event.
import React from "react";
import type { EventAddOnItem } from "../types";
import {
  MOCK_SERVICE_CATALOG,
  SERVICE_CATEGORIES,
} from "mocks/community-hub/service-catalog";
import type { IServiceItem } from "mocks/community-hub/service-catalog";
import { serviceToAddOnItem } from "../types.industry";
import { THEME, formatVND } from "../shared";

interface Props {
  selectedIds: string[]; // IServiceItem.id đã chọn
  onToggle: (svcId: string, item: EventAddOnItem | null) => void;
}

export default function ServiceCatalogPicker({ selectedIds, onToggle }: Props) {
  const activeServices = MOCK_SERVICE_CATALOG.filter((s) => s.status === "active" && s.sellable);
  const selectedSet = new Set(selectedIds);

  const handleToggle = (svc: IServiceItem) => {
    if (selectedSet.has(svc.id)) {
      onToggle(svc.id, null); // remove
    } else {
      onToggle(svc.id, serviceToAddOnItem(svc)); // add
    }
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 10px" }}>
        Chọn dịch vụ từ danh mục Community Hub để bán thêm khi đăng ký sự kiện.
      </p>

      {SERVICE_CATEGORIES.map((cat) => {
        const items = activeServices.filter((s) => s.category === cat.key);
        if (!items.length) return null;
        return (
          <div key={cat.key} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.primaryDark, marginBottom: 6 }}>
              {cat.icon} {cat.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {items.map((svc) => {
                const active = selectedSet.has(svc.id);
                return (
                  <button
                    key={svc.id}
                    onClick={() => handleToggle(svc)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 16,
                      border: `1.5px solid ${active ? THEME.primary : THEME.border}`,
                      background: active ? THEME.primarySoft : "#fff",
                      color: active ? THEME.primaryDark : THEME.textMain,
                      fontSize: 12,
                      cursor: "pointer",
                      fontWeight: active ? 700 : 400,
                      transition: "all .1s",
                    }}
                  >
                    {active ? "✓ " : ""}{svc.name} — {formatVND(svc.price)}/{svc.unit}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
