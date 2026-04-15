// T4 — Lịch thuế: hiển thị tất cả kỳ trong năm + trạng thái + số ngày còn lại.

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Badge, Alert } from "./common";
import { taxTheme as T } from "./theme";
import { taxEngine } from "../domain/engine";
import { taxStorage } from "../services/taxStorage";
import { useTaxpayerProfile } from "./hooks";

export default function TaxCalendar() {
  const [profile] = useTaxpayerProfile();
  const [year, setYear] = useState(new Date().getFullYear());
  const schedulePeriods = taxEngine.deadlineHelper.buildYearCalendar(
    profile,
    year
  );
  const declarations = taxStorage.listDeclarations();

  // Merge thêm các kỳ có declaration nhưng chưa nằm trong lịch cấu hình
  // (ví dụ user cấu hình năm nhưng có lập riêng 1 tờ khai tháng).
  // Điều này đảm bảo mọi tờ khai đã nộp đều hiển thị trên calendar.
  const scheduleIds = new Set(schedulePeriods.map((p) => p.id));
  const extraPeriods = declarations
    .filter(
      (d) =>
        !scheduleIds.has(d.period.id) &&
        d.period.startDate.slice(0, 4) === String(year)
    )
    .map((d) => d.period);
  // Deduplicate extras by id
  const extraById = new Map(extraPeriods.map((p) => [p.id, p]));
  const periods = [...schedulePeriods, ...Array.from(extraById.values())].sort(
    (a, b) => a.startDate.localeCompare(b.startDate)
  );

  const today = new Date();
  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: T.spacing.lg,
          alignItems: "center",
        }}
      >
        <button
          onClick={() => setYear(year - 1)}
          style={{
            padding: "6px 12px",
            border: `1px solid ${T.colors.border}`,
            borderRadius: T.radius.md,
            background: "#fff",
            cursor: "pointer",
          }}
        >
          ← {year - 1}
        </button>
        <h3 style={{ margin: 0, color: T.colors.primaryDark }}>Năm {year}</h3>
        <button
          onClick={() => setYear(year + 1)}
          style={{
            padding: "6px 12px",
            border: `1px solid ${T.colors.border}`,
            borderRadius: T.radius.md,
            background: "#fff",
            cursor: "pointer",
          }}
        >
          {year + 1} →
        </button>
      </div>

      <Alert tone="info">
        Lịch sinh tự động theo <b>kỳ khai {profile.periodKind}</b>. Muốn đổi vào{" "}
        <Link to="/tax/profile">T1 — Hồ sơ thuế</Link>.
      </Alert>

      <div style={{ display: "grid", gap: T.spacing.md }}>
        {periods.map((p) => {
          const days = taxEngine.deadlineHelper.daysUntilDue(p, today);
          const existingDecl = declarations.find(
            (d) => d.period.id === p.id
          );
          const status = existingDecl?.status;

          let tone: "success" | "warning" | "danger" | "neutral" = "neutral";
          let statusLabel = "Chưa lập";
          if (status === "submitted" || status === "accepted") {
            tone = "success";
            statusLabel = "Đã nộp";
          } else if (status === "signed") {
            tone = "warning";
            statusLabel = "Đã ký, chưa nộp";
          } else if (status === "draft") {
            tone = "warning";
            statusLabel = "Đang lập (nháp)";
          } else if (days < 0) {
            tone = "danger";
            statusLabel = `Quá hạn ${Math.abs(days)} ngày`;
          } else if (days <= 7) {
            tone = "warning";
            statusLabel = `Sắp đến hạn (${days} ngày)`;
          }

          return (
            <Card key={p.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: T.colors.primaryDark,
                      fontSize: T.font.h3,
                    }}
                  >
                    {p.label}
                  </div>
                  <div
                    style={{
                      fontSize: T.font.tiny,
                      color: T.colors.textMuted,
                      marginTop: 2,
                    }}
                  >
                    Kỳ thuế: {p.startDate} → {p.endDate} · Hạn nộp:{" "}
                    <b>{p.dueDate}</b>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <Badge tone={tone}>{statusLabel}</Badge>
                  <Link
                    to="/tax/declaration"
                    style={{
                      padding: "6px 14px",
                      background: T.colors.primary,
                      color: "#fff",
                      borderRadius: T.radius.md,
                      textDecoration: "none",
                      fontSize: T.font.small,
                      fontWeight: 600,
                    }}
                  >
                    {existingDecl ? "Xem" : "Lập"}
                  </Link>
                  {existingDecl &&
                    (existingDecl.status === "submitted" ||
                      existingDecl.status === "accepted") && (
                      <Link
                        to={`/tax/declaration?amend=${existingDecl.id}`}
                        title="Lập tờ khai bổ sung (sửa sai)"
                        style={{
                          padding: "6px 12px",
                          background: "#fff",
                          color: T.colors.warning,
                          border: `1px solid ${T.colors.warning}`,
                          borderRadius: T.radius.md,
                          textDecoration: "none",
                          fontSize: T.font.small,
                          fontWeight: 600,
                        }}
                      >
                        📝 Bổ sung
                      </Link>
                    )}
                </div>
              </div>
              {existingDecl?.receiptCode && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 8,
                    background: T.colors.primarySoft,
                    borderRadius: T.radius.sm,
                    fontSize: T.font.tiny,
                    color: T.colors.textMain,
                  }}
                >
                  📄 Mã tra cứu TCT: <b>{existingDecl.receiptCode}</b>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
