// T2 — Sổ doanh thu & chi phí theo kỳ thuế.
// Aggregate từ adapter, hiển thị list có filter theo nhóm ngành.

import React, { useMemo, useState } from "react";
import { Card, Button, Badge, formatVND, Alert } from "./common";
import { taxTheme as T } from "./theme";
import { INDUSTRY_GROUP_LABELS } from "../domain/constants";
import { taxEngine } from "../domain/engine";
import type { IndustryGroup, ExpenseCategory } from "../domain/types";
import { useTaxpayerProfile, usePeriodData } from "./hooks";

const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  labor: "[24] Nhân công",
  electricity: "[25] Điện",
  water: "[26] Nước",
  telecom: "[27] Viễn thông",
  rent: "[28] Thuê mặt bằng",
  admin: "[29] Quản lý",
  other: "[30] Khác",
};

export default function RevenueExpenseBook() {
  const [profile] = useTaxpayerProfile();
  const [periodKind, setPeriodKind] = useState<"month" | "quarter" | "year">(
    "month"
  );
  const period = useMemo(() => {
    const helper = taxEngine.deadlineHelper;
    if (periodKind === "month") return helper.buildMonthPeriod(new Date());
    if (periodKind === "quarter") return helper.buildQuarterPeriod(new Date());
    return helper.buildYearPeriod(new Date());
  }, [periodKind]);

  const { revenues, expenses, loading, adapterName } = usePeriodData(period);
  const [filter, setFilter] = useState<IndustryGroup | "all">("all");

  const filteredRev =
    filter === "all" ? revenues : revenues.filter((r) => r.industryGroup === filter);

  const totalRev = filteredRev.reduce((s, r) => s + r.amount, 0);
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: T.spacing.lg,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: T.font.small, color: T.colors.textMuted }}>
          Kỳ:
        </span>
        {(["month", "quarter", "year"] as const).map((k) => (
          <Button
            key={k}
            variant={periodKind === k ? "primary" : "ghost"}
            size="sm"
            onClick={() => setPeriodKind(k)}
          >
            {k === "month" ? "Tháng này" : k === "quarter" ? "Quý này" : "Năm nay"}
          </Button>
        ))}
        <div style={{ flex: 1 }} />
        <Badge tone="info">Nguồn: {adapterName || "—"}</Badge>
        <Badge tone="neutral">{period.label}</Badge>
      </div>

      {loading && (
        <Alert tone="info" title="Đang tải dữ liệu…">
          Adapter đang lấy dữ liệu từ nguồn
        </Alert>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: T.spacing.lg,
        }}
      >
        {/* Revenue */}
        <Card
          title="💰 Sổ doanh thu"
          subtitle={`${filteredRev.length} giao dịch · Tổng ${formatVND(totalRev)} ₫`}
          right={
            <select
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${T.colors.border}`,
                fontSize: T.font.small,
              }}
              value={filter}
              onChange={(e) => setFilter(e.target.value as IndustryGroup | "all")}
            >
              <option value="all">Tất cả ngành</option>
              {Object.keys(INDUSTRY_GROUP_LABELS).map((g) => (
                <option key={g} value={g}>
                  {INDUSTRY_GROUP_LABELS[g as IndustryGroup]}
                </option>
              ))}
            </select>
          }
        >
          <div style={{ maxHeight: 480, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  background: T.colors.tableHeader,
                }}
              >
                <tr style={{ textAlign: "left", fontSize: T.font.tiny }}>
                  <th style={{ padding: "8px 10px" }}>Ngày</th>
                  <th style={{ padding: "8px 10px" }}>Mô tả</th>
                  <th style={{ padding: "8px 10px" }}>Nhóm ngành</th>
                  <th style={{ padding: "8px 10px", textAlign: "right" }}>
                    Số tiền
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRev.slice(0, 200).map((r) => (
                  <tr
                    key={r.id}
                    style={{ borderTop: `1px solid ${T.colors.border}` }}
                  >
                    <td style={{ padding: "8px 10px", fontSize: T.font.tiny }}>
                      {r.occurredAt.slice(0, 10)}
                    </td>
                    <td style={{ padding: "8px 10px", fontSize: T.font.small }}>
                      {r.description || "—"}
                      <div style={{ fontSize: 10, color: T.colors.textMuted }}>
                        {r.sourceModule}:{r.sourceRefId}
                      </div>
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ fontSize: 10 }}>
                        {INDUSTRY_GROUP_LABELS[r.industryGroup].slice(0, 30)}…
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: 600,
                      }}
                    >
                      {formatVND(r.amount)}
                    </td>
                  </tr>
                ))}
                {filteredRev.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: 30,
                        color: T.colors.textMuted,
                      }}
                    >
                      Không có giao dịch
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Expenses */}
        <Card
          title="💸 Sổ chi phí"
          subtitle={
            profile.method === "declaration"
              ? `Tổng ${formatVND(totalExp)} ₫ · Dùng cho phụ lục 01-2/BK-HDKD`
              : "Tham khảo — phương pháp khoán không khấu trừ chi phí"
          }
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {expenses.map((e) => (
                <tr
                  key={e.id}
                  style={{ borderBottom: `1px solid ${T.colors.border}` }}
                >
                  <td style={{ padding: "10px 0", fontSize: T.font.small }}>
                    <div style={{ fontWeight: 600 }}>
                      {EXPENSE_CATEGORY_LABELS[e.category]}
                    </div>
                    <div style={{ fontSize: 11, color: T.colors.textMuted }}>
                      {e.description}
                    </div>
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      padding: "10px 0",
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: 600,
                    }}
                  >
                    {formatVND(e.amount)}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  style={{
                    padding: "12px 0",
                    fontWeight: 700,
                    color: T.colors.primaryDark,
                  }}
                >
                  Tổng cộng [31]
                </td>
                <td
                  style={{
                    textAlign: "right",
                    padding: "12px 0",
                    fontWeight: 800,
                    color: T.colors.primary,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatVND(totalExp)}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 12 }}>
            <Button variant="secondary" size="sm">
              + Thêm điều chỉnh thủ công
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
