// T2 — Sổ doanh thu & chi phí theo kỳ thuế.
// Aggregate từ adapter, hiển thị list có filter theo nhóm ngành.

import React, { useMemo, useState } from "react";
import { Card, Button, Badge, formatVND, Alert, Field, inputStyle } from "./common";
import { taxTheme as T } from "./theme";
import { INDUSTRY_GROUP_LABELS } from "../domain/constants";
import { taxEngine } from "../domain/engine";
import type { IndustryGroup, ExpenseCategory } from "../domain/types";
import { useTaxpayerProfile, usePeriodData } from "./hooks";
import { taxStorage } from "../services/taxStorage";

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

  const { revenues, expenses, loading, adapterName, refresh } = usePeriodData(period);
  const [filter, setFilter] = useState<IndustryGroup | "all">("all");

  const filteredRev =
    filter === "all" ? revenues : revenues.filter((r) => r.industryGroup === filter);

  const totalRev = filteredRev.reduce((s, r) => s + r.amount, 0);
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);

  // Manual adjustment form state
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formOk, setFormOk] = useState(false);
  const [form, setForm] = useState({
    occurredAt: new Date().toISOString().slice(0, 10),
    amount: "",
    industryGroup: profile.primaryIndustryGroup as IndustryGroup,
    description: "",
  });

  const resetForm = () => {
    setForm({
      occurredAt: new Date().toISOString().slice(0, 10),
      amount: "",
      industryGroup: profile.primaryIndustryGroup,
      description: "",
    });
    setFormError(null);
  };

  const handleAddManual = () => {
    const amt = parseInt(form.amount.replace(/[^\d]/g, ""), 10);
    if (!amt || amt <= 0) {
      setFormError("Số tiền phải lớn hơn 0");
      return;
    }
    if (!form.description.trim()) {
      setFormError("Vui lòng nhập mô tả");
      return;
    }
    taxStorage.addManualRevenue({
      occurredAt: new Date(form.occurredAt).toISOString(),
      amount: amt,
      industryGroup: form.industryGroup,
      description: form.description.trim(),
      isTaxable: true,
    });
    setFormOk(true);
    setFormError(null);
    resetForm();
    setShowForm(false);
    refresh();
    setTimeout(() => setFormOk(false), 3000);
  };

  const handleDeleteManual = (id: string) => {
    if (!confirm("Xoá điều chỉnh thủ công này?")) return;
    taxStorage.deleteManualRevenue(id);
    refresh();
  };

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
                  <th style={{ padding: "8px 10px", width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredRev.slice(0, 200).map((r) => {
                  const isManual = r.sourceModule === "manual";
                  return (
                  <tr
                    key={r.id}
                    style={{
                      borderTop: `1px solid ${T.colors.border}`,
                      background: isManual ? "#FFFBEB" : undefined,
                    }}
                  >
                    <td style={{ padding: "8px 10px", fontSize: T.font.tiny }}>
                      {r.occurredAt.slice(0, 10)}
                    </td>
                    <td style={{ padding: "8px 10px", fontSize: T.font.small }}>
                      {r.description || "—"}
                      <div style={{ fontSize: 10, color: T.colors.textMuted }}>
                        {isManual ? (
                          <Badge tone="warning">Điều chỉnh tay</Badge>
                        ) : (
                          <>{r.sourceModule}:{r.sourceRefId}</>
                        )}
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
                    <td style={{ padding: "8px 10px", textAlign: "center" }}>
                      {isManual && (
                        <button
                          onClick={() => handleDeleteManual(r.id)}
                          title="Xoá"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: T.colors.danger,
                            fontSize: 14,
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
                {filteredRev.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={5}
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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowForm(!showForm);
                setFormError(null);
              }}
            >
              {showForm ? "✕ Đóng form" : "+ Thêm điều chỉnh doanh thu thủ công"}
            </Button>
          </div>

          {showForm && (
            <div
              style={{
                marginTop: 14,
                padding: 14,
                background: "#FFFBEB",
                border: `1px dashed ${T.colors.warning}`,
                borderRadius: T.radius.md,
              }}
            >
              <div
                style={{
                  fontSize: T.font.small,
                  fontWeight: 700,
                  color: T.colors.primaryDark,
                  marginBottom: 10,
                }}
              >
                📝 Ghi nhận doanh thu bán ngoài hệ thống
              </div>
              {formError && (
                <Alert tone="danger">{formError}</Alert>
              )}
              <Field label="Ngày phát sinh" required>
                <input
                  type="date"
                  style={inputStyle}
                  value={form.occurredAt}
                  onChange={(e) =>
                    setForm({ ...form, occurredAt: e.target.value })
                  }
                />
              </Field>
              <Field label="Số tiền (VND)" required>
                <input
                  style={inputStyle}
                  placeholder="VD: 1500000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </Field>
              <Field label="Nhóm ngành" required>
                <select
                  style={inputStyle}
                  value={form.industryGroup}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      industryGroup: e.target.value as IndustryGroup,
                    })
                  }
                >
                  {Object.entries(INDUSTRY_GROUP_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mô tả" required>
                <input
                  style={inputStyle}
                  placeholder="VD: Bán hàng tại chợ, không qua POS"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Field>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Huỷ
                </Button>
                <Button variant="primary" size="sm" onClick={handleAddManual}>
                  💾 Lưu điều chỉnh
                </Button>
              </div>
            </div>
          )}

          {formOk && (
            <div style={{ marginTop: 10 }}>
              <Alert tone="success">
                Đã thêm điều chỉnh thủ công — doanh thu và thuế dự kiến đã được
                cập nhật lại.
              </Alert>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
