// T3 — Declaration Wizard: 5 bước lập tờ khai thuế 01/CNKD và nộp eTax.

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Alert, Badge, formatVND } from "./common";
import { taxTheme as T } from "./theme";
import { taxEngine } from "../domain/engine";
import { taxStorage } from "../services/taxStorage";
import { eTaxGateway } from "../services/eTaxGateway";
import { FORM_CODES, FORM_LABELS } from "../domain/constants";
import { useTaxpayerProfile, usePeriodData, useTaxCalculation } from "./hooks";
import type { TaxPeriodKind, TaxDeclaration } from "../domain/types";
import DeclarationPreview from "./DeclarationPreview";

const STEPS = [
  { key: 1, label: "Chọn kỳ" },
  { key: 2, label: "Tổng hợp" },
  { key: 3, label: "Preview 01/CNKD" },
  { key: 4, label: "Ký số" },
  { key: 5, label: "Nộp eTax" },
] as const;

export default function DeclarationWizard() {
  const [profile] = useTaxpayerProfile();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [periodKind, setPeriodKind] = useState<TaxPeriodKind>(profile.periodKind);

  const period = useMemo(() => {
    const helper = taxEngine.deadlineHelper;
    const d = new Date();
    if (periodKind === "month") return helper.buildMonthPeriod(d);
    if (periodKind === "quarter") return helper.buildQuarterPeriod(d);
    if (periodKind === "year") return helper.buildYearPeriod(d);
    return helper.buildOccurrencePeriod(d);
  }, [periodKind]);

  const { revenues, expenses, loading } = usePeriodData(period);
  const { calculation } = useTaxCalculation(profile, period, revenues, expenses);

  const [declaration, setDeclaration] = useState<TaxDeclaration | null>(null);
  const [signing, setSigning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const buildDeclaration = () => {
    if (!calculation) return;
    const decl = taxEngine.declarationBuilder.build({
      taxpayer: profile,
      period,
      calculation,
    });
    const saved = taxStorage.saveDeclaration(decl);
    setDeclaration(saved);
    setStep(3);
  };

  const handleSign = async () => {
    if (!declaration) return;
    setSigning(true);
    const result = await eTaxGateway.sign({ declaration, method: "mock" });
    setSigning(false);
    if (result.ok) {
      const updated = taxStorage.saveDeclaration({
        ...declaration,
        status: "signed",
      });
      setDeclaration(updated);
      setStep(5);
    }
  };

  const handleSubmit = async () => {
    if (!declaration) return;
    setSubmitting(true);
    const result = await eTaxGateway.submit({
      declaration,
      environment: "test",
    });
    setSubmitting(false);
    if (result.ok) {
      const updated = taxStorage.saveDeclaration({
        ...declaration,
        status: "submitted",
        submittedAt: result.submittedAt,
        receiptCode: result.receiptCode,
        submissionChannel: "etax_mobile",
      });
      setDeclaration(updated);
    }
  };

  const noProfile = !profile.taxCode || !profile.fullName;

  return (
    <div>
      {/* Stepper */}
      <Card style={{ marginBottom: T.spacing.lg }}>
        <div
          style={{
            display: "flex",
            gap: 0,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {STEPS.map((s, idx) => {
            const active = step === s.key;
            const done = step > s.key;
            return (
              <React.Fragment key={s.key}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      background: done
                        ? T.colors.success
                        : active
                        ? T.colors.primary
                        : T.colors.border,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {done ? "✓" : s.key}
                  </div>
                  <div
                    style={{
                      fontSize: T.font.tiny,
                      color: active ? T.colors.primaryDark : T.colors.textMuted,
                      marginTop: 6,
                      fontWeight: active ? 700 : 500,
                      textAlign: "center",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 0.5,
                      height: 2,
                      background:
                        step > s.key ? T.colors.success : T.colors.border,
                      marginTop: -20,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {noProfile && (
        <Alert tone="warning" title="Chưa có hồ sơ thuế">
          Vui lòng hoàn tất{" "}
          <Link to="/tax/profile" style={{ fontWeight: 700 }}>
            T1 — Hồ sơ thuế
          </Link>{" "}
          trước khi lập tờ khai.
        </Alert>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <Card
          title="Bước 1 — Chọn kỳ tính thuế"
          subtitle="Chọn loại kỳ cần lập tờ khai"
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(
              ["month", "quarter", "year", "occurrence"] as TaxPeriodKind[]
            ).map((k) => (
              <button
                key={k}
                onClick={() => setPeriodKind(k)}
                style={{
                  padding: 16,
                  border:
                    periodKind === k
                      ? `2px solid ${T.colors.primary}`
                      : `1px solid ${T.colors.border}`,
                  borderRadius: T.radius.md,
                  background:
                    periodKind === k ? T.colors.primarySoft : T.colors.cardBg,
                  cursor: "pointer",
                  minWidth: 160,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: T.colors.primaryDark,
                    marginBottom: 4,
                  }}
                >
                  {k === "month"
                    ? "📅 Khai tháng"
                    : k === "quarter"
                    ? "🗓️ Khai quý"
                    : k === "year"
                    ? "📆 Khai năm"
                    : "⚡ Từng lần"}
                </div>
                <div style={{ fontSize: 11, color: T.colors.textMuted }}>
                  {k === "month"
                    ? "Hạn: ngày 20 tháng sau"
                    : k === "quarter"
                    ? "Hạn: ngày 31 tháng đầu quý sau"
                    : k === "year"
                    ? "Hạn: 31/3 năm kế tiếp"
                    : "Theo mỗi giao dịch phát sinh"}
                </div>
              </button>
            ))}
          </div>
          <div
            style={{
              marginTop: T.spacing.lg,
              padding: T.spacing.md,
              background: T.colors.primarySoft,
              borderRadius: T.radius.md,
            }}
          >
            <Badge tone="info">{period.label}</Badge>{" "}
            <span style={{ fontSize: T.font.small, color: T.colors.textMain }}>
              Từ {period.startDate} đến {period.endDate} · Hạn nộp{" "}
              <b>{period.dueDate}</b>
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: T.spacing.lg,
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => setStep(2)}
              disabled={noProfile}
            >
              Tiếp tục →
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card
          title="Bước 2 — Tổng hợp doanh thu & chi phí"
          subtitle={`Adapter đang lấy dữ liệu kỳ ${period.label}`}
        >
          {loading ? (
            <div style={{ color: T.colors.textMuted }}>Đang tải…</div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                  marginBottom: T.spacing.lg,
                }}
              >
                <Stat label="Giao dịch DT" value={revenues.length.toString()} />
                <Stat
                  label="Tổng doanh thu"
                  value={formatVND(calculation?.totalRevenue ?? 0)}
                  unit="₫"
                />
                <Stat
                  label="Tổng thuế dự kiến"
                  value={formatVND(calculation?.totalTaxPayable ?? 0)}
                  unit="₫"
                  tone="warning"
                />
                <Stat
                  label="Lợi nhuận ước tính"
                  value={formatVND(calculation?.estimatedProfit ?? 0)}
                  unit="₫"
                  tone="success"
                />
              </div>
              <Alert tone="info">
                Dữ liệu được lấy từ adapter hiện tại. Bạn có thể bổ sung/điều
                chỉnh thủ công ở tab{" "}
                <Link to="/tax/book" style={{ fontWeight: 700 }}>
                  T2 — Sổ DT/CP
                </Link>
                .
              </Alert>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: T.spacing.lg,
                }}
              >
                <Button variant="ghost" onClick={() => setStep(1)}>
                  ← Quay lại
                </Button>
                <Button variant="primary" size="lg" onClick={buildDeclaration}>
                  Lập tờ khai {FORM_CODES.MAIN_01_CNKD} →
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Step 3 — Preview */}
      {step === 3 && declaration && calculation && (
        <div>
          <Card
            title={`Bước 3 — Preview mẫu ${declaration.formCode}`}
            subtitle={FORM_LABELS[declaration.formCode]}
            right={
              <Button variant="ghost" size="sm" onClick={() => window.print()}>
                🖨️ In
              </Button>
            }
            style={{ marginBottom: T.spacing.lg }}
          >
            <DeclarationPreview
              taxpayer={profile}
              period={period}
              calculation={calculation}
            />
          </Card>

          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: T.font.small, color: T.colors.textMuted }}>
                Kiểm tra kỹ các chỉ tiêu trước khi ký số. XML payload đã sẵn sàng
                ({declaration.xmlPayload?.length ?? 0} ký tự).
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Button variant="ghost" onClick={() => setStep(2)}>
                  ← Điều chỉnh
                </Button>
                <Button variant="primary" size="lg" onClick={() => setStep(4)}>
                  Tiếp tục ký số →
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Step 4 — Ký số */}
      {step === 4 && declaration && (
        <Card title="Bước 4 — Ký số tờ khai">
          <Alert tone="info" title="Chữ ký số">
            Hệ thống hỗ trợ 3 loại: USB Token (Viettel-CA, VNPT-CA, FPT-CA), Remote
            Signing và SmartCA. <b>Bản MVP hiện tại dùng mock signing</b> để demo
            luồng.
          </Alert>
          <div style={{ textAlign: "center", padding: T.spacing.xl }}>
            <div style={{ fontSize: 60, marginBottom: 8 }}>🔏</div>
            <div
              style={{
                fontSize: T.font.h3,
                fontWeight: 700,
                color: T.colors.primaryDark,
                marginBottom: 16,
              }}
            >
              Ký tờ khai {declaration.formCode} kỳ {period.label}
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSign}
              disabled={signing}
            >
              {signing ? "Đang ký..." : "🔐 Ký số & xác nhận"}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 5 — Nộp */}
      {step === 5 && declaration && (
        <Card title="Bước 5 — Nộp tờ khai qua eTax">
          {declaration.status === "signed" && !declaration.receiptCode && (
            <>
              <Alert tone="success" title="Tờ khai đã được ký số thành công">
                Bạn có thể nộp trực tiếp lên Cổng thuế điện tử TCT hoặc chuyển qua
                đại lý thuế.
              </Alert>
              <div style={{ textAlign: "center", padding: T.spacing.xl }}>
                <div style={{ fontSize: 60, marginBottom: 8 }}>📤</div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Đang nộp..." : "🚀 Nộp lên eTax Mobile"}
                </Button>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: T.font.tiny,
                    color: T.colors.textMuted,
                  }}
                >
                  Endpoint: thuedientu.gdt.gov.vn (test env trong MVP)
                </div>
              </div>
            </>
          )}
          {declaration.receiptCode && (
            <Alert tone="success" title="Nộp thành công!">
              Mã tra cứu: <b>{declaration.receiptCode}</b>
              <br />
              Thời gian: {declaration.submittedAt}
              <br />
              Hệ thống TCT sẽ phản hồi trạng thái chấp nhận/từ chối trong vòng 24h.
            </Alert>
          )}
        </Card>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  tone = "primary",
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "primary" | "warning" | "success";
}) {
  const color = {
    primary: T.colors.primaryDark,
    warning: T.colors.warning,
    success: T.colors.success,
  }[tone];
  return (
    <div
      style={{
        padding: 14,
        background: T.colors.primarySoft,
        borderRadius: T.radius.md,
      }}
    >
      <div style={{ fontSize: T.font.tiny, color: T.colors.textMuted }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color, marginTop: 4 }}>
        {value} <span style={{ fontSize: 12 }}>{unit}</span>
      </div>
    </div>
  );
}
