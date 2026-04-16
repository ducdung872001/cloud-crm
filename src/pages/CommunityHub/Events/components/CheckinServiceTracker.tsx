// ĐẶC THÙ: Admin-side — tracking dịch vụ khách sử dụng trong sự kiện.
import React, { useState, useMemo } from "react";
import type { EventRegistration } from "../types";
import type { ServiceUsageRecord } from "../types.industry";
import {
  MOCK_SERVICE_CATALOG,
  SERVICE_CATEGORIES,
} from "mocks/community-hub/service-catalog";
import { industryEventStorage } from "../storage.industry";
import { THEME, formatVND } from "../shared";

interface Props {
  registrations: EventRegistration[];
  onRefresh: () => void;
}

export default function CheckinServiceTracker({ registrations, onRefresh }: Props) {
  const [selectedRegId, setSelectedRegId] = useState<string>("");
  const [selectedSvcId, setSelectedSvcId] = useState<string>("");
  const [qty, setQty] = useState(1);

  const checkedInRegs = registrations.filter((r) => r.status === "checked_in");

  const regIds = useMemo(() => checkedInRegs.map((r) => r.id), [checkedInRegs]);
  const usageRecords = useMemo(
    () => industryEventStorage.listServiceUsageByEvent(regIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [regIds.join(",")],
  );

  const activeServices = MOCK_SERVICE_CATALOG.filter(
    (s) => s.status === "active" && s.sellable,
  );

  const handleAdd = () => {
    if (!selectedRegId || !selectedSvcId) return;
    const svc = MOCK_SERVICE_CATALOG.find((s) => s.id === selectedSvcId);
    if (!svc) return;
    industryEventStorage.addServiceUsage({
      registrationId: selectedRegId,
      serviceId: svc.id,
      serviceName: svc.name,
      qty,
      unitPrice: svc.price,
      recordedBy: "Admin",
    });
    setQty(1);
    onRefresh();
  };

  const handleRemove = (id: string) => {
    industryEventStorage.removeServiceUsage(id);
    onRefresh();
  };

  const selectedRegUsage = usageRecords.filter((u) => u.registrationId === selectedRegId);
  const selectedRegTotal = selectedRegUsage.reduce((s, u) => s + u.qty * u.unitPrice, 0);

  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ fontSize: 14, color: THEME.primaryDark, margin: "0 0 10px" }}>
        Tracking dịch vụ sử dụng
      </h4>

      {checkedInRegs.length === 0 ? (
        <p style={{ fontSize: 12, color: THEME.textMuted }}>
          Chưa có khách check-in. Check-in trước rồi mới tracking dịch vụ.
        </p>
      ) : (
        <>
          {/* Select registrant */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <select
              value={selectedRegId}
              onChange={(e) => setSelectedRegId(e.target.value)}
              style={selectStyle}
            >
              <option value="">-- Chọn khách --</option>
              {checkedInRegs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fullName} ({r.phone})
                </option>
              ))}
            </select>

            <select
              value={selectedSvcId}
              onChange={(e) => setSelectedSvcId(e.target.value)}
              style={selectStyle}
            >
              <option value="">-- Chọn dịch vụ --</option>
              {SERVICE_CATEGORIES.map((cat) => {
                const items = activeServices.filter((s) => s.category === cat.key);
                if (!items.length) return null;
                return (
                  <optgroup key={cat.key} label={`${cat.icon} ${cat.label}`}>
                    {items.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {formatVND(s.price)}/{s.unit}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>

            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Math.max(1, +e.target.value))}
              min={1}
              style={{ width: 60, ...selectStyle }}
            />

            <button
              onClick={handleAdd}
              disabled={!selectedRegId || !selectedSvcId}
              style={{
                padding: "8px 14px",
                background: selectedRegId && selectedSvcId ? THEME.primary : THEME.border,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: 700,
                cursor: selectedRegId && selectedSvcId ? "pointer" : "default",
                fontSize: 12,
              }}
            >
              + Ghi nhận
            </button>
          </div>

          {/* Usage table for selected reg */}
          {selectedRegId && selectedRegUsage.length > 0 && (
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: THEME.primarySoft, textAlign: "left" }}>
                    <th style={thStyle}>Dịch vụ</th>
                    <th style={thStyle}>SL</th>
                    <th style={thStyle}>Đơn giá</th>
                    <th style={thStyle}>Thành tiền</th>
                    <th style={thStyle}>Thời gian</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRegUsage.map((u) => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={tdStyle}>{u.serviceName}</td>
                      <td style={tdStyle}>{u.qty}</td>
                      <td style={tdStyle}>{formatVND(u.unitPrice)}</td>
                      <td style={tdStyle}>{formatVND(u.qty * u.unitPrice)}</td>
                      <td style={tdStyle}>{new Date(u.recordedAt).toLocaleTimeString("vi-VN")}</td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => handleRemove(u.id)}
                          style={{
                            padding: "2px 8px",
                            fontSize: 11,
                            color: THEME.danger,
                            border: `1px solid ${THEME.danger}`,
                            borderRadius: 4,
                            background: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div
                style={{
                  textAlign: "right",
                  padding: "8px 12px",
                  fontWeight: 700,
                  fontSize: 13,
                  color: THEME.primaryDark,
                }}
              >
                Tổng: {formatVND(selectedRegTotal)} VND
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #D9E0DE",
  borderRadius: 6,
  fontSize: 12,
  outline: "none",
};

const thStyle: React.CSSProperties = {
  padding: "8px 10px",
  fontWeight: 700,
  fontSize: 11,
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
};
