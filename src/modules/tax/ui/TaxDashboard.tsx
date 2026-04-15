// Dashboard — 5 chỉ số sinh tồn theo slide 8 của chiến lược Reborn CRM Tax.

import React, { useEffect, useState } from "react";
import { Card, KpiTile, Alert, Badge, formatVNDFull, formatVND } from "./common";
import { taxTheme as T } from "./theme";
import { taxEngine } from "../domain/engine";
import { INDUSTRY_GROUP_LABELS, TAX_METHOD_LABELS } from "../domain/constants";
import { useTaxpayerProfile, usePeriodData, useTaxCalculation } from "./hooks";

export default function TaxDashboard() {
  const [profile] = useTaxpayerProfile();
  const [period] = useState(() =>
    taxEngine.deadlineHelper.buildCurrentPeriod(profile)
  );
  const { revenues, expenses, loading, adapterName } = usePeriodData(period);
  const { calculation, warnings } = useTaxCalculation(
    profile,
    period,
    revenues,
    expenses
  );

  const daysLeft = taxEngine.deadlineHelper.daysUntilDue(period);
  const hasProfile = profile.taxCode && profile.fullName;

  return (
    <div>
      {!hasProfile && (
        <Alert tone="info" title="Chưa có hồ sơ thuế">
          Hãy hoàn tất đăng ký hồ sơ thuế trong tab{" "}
          <a
            href="/tax/profile"
            style={{ color: T.colors.primaryDark, fontWeight: 700 }}
          >
            T1 — Hồ sơ thuế
          </a>{" "}
          để hệ thống có thể tự động lập tờ khai.
        </Alert>
      )}

      {warnings.map((w, i) => (
        <Alert
          key={i}
          tone={
            w.severity === "critical"
              ? "danger"
              : w.severity === "warning"
              ? "warning"
              : "info"
          }
          title={
            w.code === "near_exemption"
              ? "Gần ngưỡng miễn thuế"
              : w.code === "crossed_exemption"
              ? "Đã vượt ngưỡng 100 triệu"
              : w.code === "must_use_cash_register"
              ? "Bắt buộc máy tính tiền kết nối cơ quan thuế"
              : w.code === "must_switch_to_declaration"
              ? "Phải chuyển phương pháp kê khai"
              : ""
          }
        >
          {w.message}
        </Alert>
      ))}

      {/* 5 chỉ số sinh tồn */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: T.spacing.md,
          marginBottom: T.spacing.xl,
        }}
      >
        <KpiTile
          icon="💰"
          label={`Doanh thu — ${period.label}`}
          tone="primary"
          value={loading ? "…" : formatVNDFull(calculation?.totalRevenue ?? 0)}
          hint={`Từ ${revenues.length} giao dịch · nguồn: ${adapterName || "—"}`}
        />
        <KpiTile
          icon="📥"
          label="Thuế GTGT dự kiến"
          tone="info"
          value={loading ? "…" : formatVNDFull(calculation?.totalVat ?? 0)}
          hint="Theo tỷ lệ % ngành TT40/2021"
        />
        <KpiTile
          icon="📤"
          label="Thuế TNCN dự kiến"
          tone="info"
          value={loading ? "…" : formatVNDFull(calculation?.totalPit ?? 0)}
          hint="Thu nhập cá nhân"
        />
        <KpiTile
          icon="🧾"
          label="Tổng thuế phải nộp"
          tone="warning"
          value={
            loading ? "…" : formatVNDFull(calculation?.totalTaxPayable ?? 0)
          }
          hint={
            calculation?.licenseFee
              ? `Đã gồm môn bài ${formatVND(calculation.licenseFee)} ₫`
              : "Chưa gồm môn bài (tính theo năm)"
          }
        />
        <KpiTile
          icon="📈"
          label="Lợi nhuận ước tính"
          tone="success"
          value={
            loading ? "…" : formatVNDFull(calculation?.estimatedProfit ?? 0)
          }
          hint="Doanh thu − chi phí − thuế"
        />
      </div>

      {/* Row 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: T.spacing.lg,
        }}
      >
        <Card
          title="Phân bổ doanh thu theo nhóm ngành"
          subtitle="Mẫu 01/CNKD — 4 dòng chỉ tiêu [26]–[32]"
        >
          {calculation && calculation.breakdowns.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: T.colors.tableHeader,
                    textAlign: "left",
                    fontSize: T.font.small,
                  }}
                >
                  <th style={{ padding: "8px 10px" }}>Nhóm ngành</th>
                  <th style={{ padding: "8px 10px", textAlign: "right" }}>
                    Doanh thu
                  </th>
                  <th style={{ padding: "8px 10px", textAlign: "right" }}>
                    GTGT
                  </th>
                  <th style={{ padding: "8px 10px", textAlign: "right" }}>
                    TNCN
                  </th>
                  <th style={{ padding: "8px 10px", textAlign: "right" }}>
                    Tổng thuế
                  </th>
                </tr>
              </thead>
              <tbody>
                {calculation.breakdowns.map((b) => (
                  <tr
                    key={b.industryGroup}
                    style={{ borderTop: `1px solid ${T.colors.border}` }}
                  >
                    <td
                      style={{
                        padding: "10px",
                        fontSize: T.font.small,
                        color: T.colors.textMain,
                      }}
                    >
                      {INDUSTRY_GROUP_LABELS[b.industryGroup]}
                      <div style={{ fontSize: T.font.tiny, color: T.colors.textMuted }}>
                        GTGT {(b.vatRate * 100).toFixed(1)}% · TNCN{" "}
                        {(b.pitRate * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatVND(b.taxableRevenue)}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatVND(b.vatAmount)}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatVND(b.pitAmount)}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "right",
                        fontWeight: 700,
                        color: T.colors.primaryDark,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatVND(b.totalAmount)}
                    </td>
                  </tr>
                ))}
                <tr
                  style={{
                    borderTop: `2px solid ${T.colors.primaryDark}`,
                    background: T.colors.primarySoft,
                  }}
                >
                  <td style={{ padding: "10px", fontWeight: 700 }}>
                    Tổng cộng [32]
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "right",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatVND(calculation.totalRevenue)}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "right",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatVND(calculation.totalVat)}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "right",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatVND(calculation.totalPit)}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "right",
                      fontWeight: 700,
                      color: T.colors.primaryDark,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatVND(calculation.totalVat + calculation.totalPit)}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div style={{ color: T.colors.textMuted, fontSize: T.font.small }}>
              Chưa có dữ liệu doanh thu trong kỳ
            </div>
          )}
        </Card>

        <Card
          title="Thông tin kỳ hiện tại"
          subtitle={`Kỳ thuế ${period.label}`}
        >
          <KV label="Phương pháp" value={TAX_METHOD_LABELS[profile.method]} />
          <KV
            label="Ngành nghề"
            value={INDUSTRY_GROUP_LABELS[profile.primaryIndustryGroup]}
          />
          <KV label="Từ ngày" value={period.startDate} />
          <KV label="Đến ngày" value={period.endDate} />
          <KV label="Hạn nộp" value={period.dueDate} />
          <div style={{ marginTop: T.spacing.md }}>
            <Badge
              tone={
                daysLeft < 0
                  ? "danger"
                  : daysLeft <= 7
                  ? "warning"
                  : "success"
              }
            >
              {daysLeft < 0
                ? `Quá hạn ${Math.abs(daysLeft)} ngày`
                : `Còn ${daysLeft} ngày`}
            </Badge>
          </div>
          <div style={{ marginTop: T.spacing.lg }}>
            <a
              href="/tax/declaration"
              style={{
                display: "block",
                textAlign: "center",
                padding: "10px",
                background: T.colors.primary,
                color: "#fff",
                borderRadius: T.radius.md,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: T.font.body,
              }}
            >
              📝 Lập tờ khai ngay
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: `1px dashed ${T.colors.border}`,
        fontSize: T.font.small,
      }}
    >
      <span style={{ color: T.colors.textMuted }}>{label}</span>
      <span style={{ color: T.colors.primaryDark, fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}
