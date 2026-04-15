// Q4 — Form 01/LPMB (Lệ phí môn bài) — tờ khai riêng, 1 lần/năm.
// Hạn nộp 30/01 hằng năm. Tính theo bậc doanh thu:
//   ≤ 100tr → miễn
//   100–300tr → 300.000
//   300–500tr → 500.000
//   > 500tr → 1.000.000

import React, { useMemo, useState } from "react";
import { Card, Button, Alert, Field, inputStyle, Badge, formatVND, formatVNDFull } from "./common";
import { taxTheme as T } from "./theme";
import { taxEngine } from "../domain/engine";
import { taxStorage } from "../services/taxStorage";
import { eTaxGateway } from "../services/eTaxGateway";
import { FORM_CODES, REVENUE_THRESHOLDS } from "../domain/constants";
import { useTaxpayerProfile } from "./hooks";
import type { TaxDeclaration, TaxPeriod } from "../domain/types";

export default function LicenseFeePage() {
  const [profile] = useTaxpayerProfile();
  const [year, setYear] = useState(new Date().getFullYear());
  const [revenueInput, setRevenueInput] = useState("");
  const [declaration, setDeclaration] = useState<TaxDeclaration | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const parsedRevenue = parseInt(revenueInput.replace(/[^\d]/g, ""), 10) || 0;

  // Nếu user chưa nhập, ước từ declarations năm trước
  const autoRevenue = useMemo(() => {
    const decls = taxStorage.listDeclarations();
    const lastYear = year - 1;
    const sum = decls
      .filter(
        (d) =>
          d.formCode !== FORM_CODES.LICENSE_01_LPMB &&
          d.period.startDate.startsWith(`${lastYear}-`)
      )
      .reduce((s, d) => s + (d.calculation?.totalRevenue ?? 0), 0);
    return sum;
  }, [year]);

  const effectiveRevenue = parsedRevenue > 0 ? parsedRevenue : autoRevenue;
  const feeAmount = taxEngine.calculator.calcLicenseFee(effectiveRevenue);
  const dueDate = `${year}-01-30`;
  const noProfile = !profile.taxCode || !profile.fullName;

  // Check đã có tờ khai môn bài cho năm này chưa
  const existing = useMemo(
    () =>
      taxStorage
        .listDeclarations()
        .find(
          (d) =>
            d.formCode === FORM_CODES.LICENSE_01_LPMB &&
            d.period.startDate.startsWith(`${year}-`)
        ),
    [year, declaration]
  );

  const handleDeclare = async () => {
    if (feeAmount === 0) {
      alert(
        "Doanh thu dưới ngưỡng 100 triệu/năm — được miễn lệ phí môn bài."
      );
      return;
    }
    const period: TaxPeriod = {
      id: `license-${year}`,
      kind: "year",
      label: `Môn bài năm ${year}`,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      dueDate,
      status: "draft",
    };
    // Build minimal calculation để lưu
    const calculation = {
      periodId: period.id,
      totalRevenue: effectiveRevenue,
      totalDeductibleExpense: 0,
      breakdowns: [],
      totalVat: 0,
      totalPit: 0,
      specialConsumptionTax: 0,
      resourceTax: 0,
      environmentFee: 0,
      licenseFee: feeAmount,
      totalTaxPayable: feeAmount,
      estimatedProfit: 0,
    };
    const decl = taxEngine.declarationBuilder.build({
      taxpayer: profile,
      period,
      calculation,
      formCode: FORM_CODES.LICENSE_01_LPMB,
    });
    const saved = taxStorage.saveDeclaration(decl);
    setDeclaration(saved);
  };

  const handleSubmit = async () => {
    if (!declaration) return;
    const signResult = await eTaxGateway.sign({
      declaration,
      method: "mock",
    });
    if (!signResult.ok) return;
    const signed = taxStorage.saveDeclaration({
      ...declaration,
      status: "signed",
    });
    const submitResult = await eTaxGateway.submit({
      declaration: signed,
      environment: "test",
    });
    if (submitResult.ok) {
      const finalDecl = taxStorage.saveDeclaration({
        ...signed,
        status: "submitted",
        submittedAt: submitResult.submittedAt,
        receiptCode: submitResult.receiptCode,
        submissionChannel: "etax_mobile",
      });
      setDeclaration(finalDecl);
      setSubmitted(true);
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      {noProfile && (
        <Alert tone="warning" title="Chưa có hồ sơ thuế">
          Hoàn tất hồ sơ thuế trước khi lập tờ khai môn bài.
        </Alert>
      )}

      {existing && !declaration && (
        <Alert tone="success" title={`Đã lập tờ khai môn bài năm ${year}`}>
          Trạng thái: <b>{existing.status}</b>
          {existing.receiptCode && (
            <>
              {" "}
              — mã tra cứu: <code>{existing.receiptCode}</code>
            </>
          )}
        </Alert>
      )}

      <Card
        title={`🏷️ Tờ khai lệ phí môn bài — Mẫu ${FORM_CODES.LICENSE_01_LPMB}`}
        subtitle={`Áp dụng cho HKD/CNKD có doanh thu trên 100 triệu đồng/năm · Hạn nộp ${dueDate}`}
      >
        <Alert tone="info">
          Lệ phí môn bài nộp 1 lần/năm, tính theo bậc doanh thu năm liền kề
          trước. Cơ sở pháp lý: NĐ 139/2016/NĐ-CP.
        </Alert>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginTop: 12,
          }}
        >
          <Field label="Năm khai">
            <select
              style={inputStyle}
              value={year}
              onChange={(e) => {
                setYear(parseInt(e.target.value, 10));
                setDeclaration(null);
                setSubmitted(false);
              }}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                (y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                )
              )}
            </select>
          </Field>

          <Field
            label="Doanh thu năm trước (VND)"
            hint={
              autoRevenue > 0
                ? `Tự động: ${formatVND(autoRevenue)} ₫ từ tờ khai năm ${year - 1}`
                : "Nhập tay nếu không có dữ liệu năm trước"
            }
          >
            <input
              style={inputStyle}
              placeholder={
                autoRevenue > 0 ? formatVND(autoRevenue) : "VD: 350000000"
              }
              value={revenueInput}
              onChange={(e) => setRevenueInput(e.target.value)}
            />
          </Field>
        </div>

        {/* Bảng bậc môn bài */}
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: T.font.small,
              fontWeight: 700,
              color: T.colors.primaryDark,
              marginBottom: 6,
            }}
          >
            Bậc môn bài (NĐ 139/2016)
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: T.font.small,
            }}
          >
            <thead>
              <tr style={{ background: T.colors.tableHeader }}>
                <th style={{ padding: 8, textAlign: "left" }}>Doanh thu/năm</th>
                <th style={{ padding: 8, textAlign: "right" }}>Môn bài</th>
              </tr>
            </thead>
            <tbody>
              <TierRow
                label="≤ 100 triệu"
                value="Miễn"
                active={effectiveRevenue > 0 && effectiveRevenue <= 100_000_000}
              />
              <TierRow
                label="100–300 triệu"
                value="300.000 ₫"
                active={
                  effectiveRevenue > 100_000_000 && effectiveRevenue <= 300_000_000
                }
              />
              <TierRow
                label="300–500 triệu"
                value="500.000 ₫"
                active={
                  effectiveRevenue > 300_000_000 && effectiveRevenue <= 500_000_000
                }
              />
              <TierRow
                label="> 500 triệu"
                value="1.000.000 ₫"
                active={effectiveRevenue > 500_000_000}
              />
            </tbody>
          </table>
        </div>

        {/* Kết quả */}
        <div
          style={{
            marginTop: 18,
            padding: 16,
            background:
              feeAmount === 0 ? "#F0FDF4" : T.colors.primarySoft,
            borderRadius: T.radius.md,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: T.font.tiny, color: T.colors.textMuted }}>
              Doanh thu tính thuế
            </div>
            <div
              style={{
                fontSize: T.font.h3,
                fontWeight: 700,
                color: T.colors.primaryDark,
              }}
            >
              {formatVNDFull(effectiveRevenue)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: T.font.tiny, color: T.colors.textMuted }}>
              Môn bài phải nộp
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: feeAmount === 0 ? T.colors.success : T.colors.primary,
              }}
            >
              {feeAmount === 0 ? "Miễn" : formatVNDFull(feeAmount)}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          {!declaration && !existing && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleDeclare}
              disabled={noProfile || feeAmount === 0}
            >
              📝 Lập tờ khai {FORM_CODES.LICENSE_01_LPMB}
            </Button>
          )}
          {declaration && !submitted && (
            <Button variant="primary" size="lg" onClick={handleSubmit}>
              🚀 Ký số & nộp eTax
            </Button>
          )}
          {(submitted || (existing && existing.receiptCode)) && (
            <Badge tone="success">
              ✓ Đã nộp — mã tra cứu{" "}
              {declaration?.receiptCode ?? existing?.receiptCode}
            </Badge>
          )}
        </div>
      </Card>
    </div>
  );
}

function TierRow({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <tr
      style={{
        borderTop: `1px solid ${T.colors.border}`,
        background: active ? "#FFFBEB" : undefined,
      }}
    >
      <td style={{ padding: 8, fontWeight: active ? 700 : 400 }}>
        {active && "▶ "}
        {label}
      </td>
      <td
        style={{
          padding: 8,
          textAlign: "right",
          fontWeight: active ? 700 : 400,
          color: active ? T.colors.primary : T.colors.textMain,
        }}
      >
        {value}
      </td>
    </tr>
  );
}
