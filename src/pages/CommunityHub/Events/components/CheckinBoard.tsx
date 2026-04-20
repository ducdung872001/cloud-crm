// CHUNG: Admin-side — giao diện check-in/check-out chuyên dụng cho ngày sự kiện.
import React, { useState, useMemo } from "react";
import type { EventEntity, EventRegistration } from "../types";
import { THEME, formatDateTime } from "../shared";
import { eventStorage } from "../storage";

interface Props {
  event: EventEntity;
  registrations: EventRegistration[];
  onRefresh: () => void;
}

export default function CheckinBoard({ event, registrations, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const eligibleRegs = useMemo(
    () =>
      registrations.filter(
        (r) => r.status === "confirmed" || r.status === "checked_in",
      ),
    [registrations],
  );

  const filtered = useMemo(() => {
    let list = eligibleRegs;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          (r.ticketCode ?? "").toLowerCase().includes(q),
      );
    }
    if (dateFilter !== "all") {
      list = list.filter((r) =>
        r.selectedDates?.includes(dateFilter) || !r.selectedDates?.length,
      );
    }
    return list;
  }, [eligibleRegs, search, dateFilter]);

  const handleCheckIn = async (regId: string) => {
    const date = dateFilter !== "all" ? dateFilter : undefined;
    await eventStorage.checkInRegistrantAsync(regId, date, "Admin");
    onRefresh();
  };

  const handleCheckOut = async (regId: string) => {
    await eventStorage.checkOutRegistrantAsync(regId);
    onRefresh();
  };

  const isCheckedIn = (r: EventRegistration) => r.status === "checked_in";
  const hasOpenCheckin = (r: EventRegistration) =>
    r.checkInOutRecords?.some((rec) => !rec.checkedOutAt);

  const checkedInCount = filtered.filter(isCheckedIn).length;

  return (
    <div>
      {/* Search + filter bar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 14,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tim theo ten, SĐT, mã vé..."
          style={{
            flex: 1,
            minWidth: 200,
            padding: "10px 12px",
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
            fontSize: 13,
            outline: "none",
          }}
        />

        {/* Multi-day filter */}
        {event.selectableDates && event.selectableDates.length > 0 && (
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            <option value="all">Tất cả ngày</option>
            {event.selectableDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}

        {/* Live count */}
        <div
          style={{
            padding: "8px 14px",
            background: THEME.primarySoft,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            color: THEME.primaryDark,
          }}
        >
          {checkedInCount} / {filtered.length} đã check-in
        </div>
      </div>

      {/* Registrant grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 8,
        }}
      >
        {filtered.map((r) => {
          const ci = isCheckedIn(r);
          const hasOpen = hasOpenCheckin(r);
          return (
            <div
              key={r.id}
              style={{
                padding: 12,
                borderRadius: 8,
                border: `1.5px solid ${ci ? THEME.success : THEME.border}`,
                background: ci ? "#F0FFF4" : "#fff",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: THEME.textMain }}>
                  {r.fullName}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 8,
                    fontWeight: 600,
                    background: ci ? "#D1FAE5" : "#FEF3C7",
                    color: ci ? "#065F46" : "#92400E",
                  }}
                >
                  {ci ? "Đã check-in" : "Chưa check-in"}
                </span>
              </div>

              <div style={{ fontSize: 11, color: THEME.textMuted }}>
                {r.phone} {r.ticketCode && `| ${r.ticketCode}`}
              </div>

              {/* Check-in history */}
              {r.checkInOutRecords && r.checkInOutRecords.length > 0 && (
                <div style={{ fontSize: 10, color: THEME.textMuted }}>
                  {r.checkInOutRecords.map((rec, i) => (
                    <div key={i}>
                      In: {formatDateTime(rec.checkedInAt)}
                      {rec.selectedDate && ` (${rec.selectedDate})`}
                      {rec.checkedOutAt && ` → Out: ${formatDateTime(rec.checkedOutAt)}`}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                {!ci && (
                  <button
                    onClick={() => handleCheckIn(r.id)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: THEME.success,
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Check-in
                  </button>
                )}
                {ci && hasOpen && (
                  <button
                    onClick={() => handleCheckOut(r.id)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: THEME.warning,
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Check-out
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 30, color: THEME.textMuted, fontSize: 13 }}>
          Không tìm thấy khách đã xác nhận / đã check-in.
        </div>
      )}
    </div>
  );
}
