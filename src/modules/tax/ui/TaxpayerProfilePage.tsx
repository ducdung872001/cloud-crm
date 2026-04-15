// T1 — Hồ sơ thuế: wizard 3 bước (trắc nghiệm → phương pháp → ngành nghề)
// + form chi tiết. Sau khi lưu, profile được persist vào localStorage.

import React, { useState } from "react";
import { Card, Field, Button, Alert, inputStyle, Badge } from "./common";
import { taxTheme as T } from "./theme";
import {
  TAX_METHOD_LABELS,
  TAX_METHOD_DESCRIPTIONS,
  INDUSTRY_GROUP_LABELS,
  INDUSTRY_GROUP_EXAMPLES,
  TAX_RATES,
  PERIOD_KIND_LABELS,
} from "../domain/constants";
import type {
  TaxMethod,
  IndustryGroup,
  TaxPeriodKind,
} from "../domain/types";
import { useTaxpayerProfile, defaultProfile } from "./hooks";

export default function TaxpayerProfilePage() {
  const [profile, save] = useTaxpayerProfile();
  const [draft, setDraft] = useState(() =>
    profile.taxCode ? profile : defaultProfile()
  );
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [savedFlag, setSavedFlag] = useState(false);

  const update = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    setDraft({ ...draft, [key]: value });
    setSavedFlag(false);
  };

  const handleSave = () => {
    save(draft);
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 3000);
  };

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: T.spacing.lg }}
    >
      <div>
        {savedFlag && (
          <Alert tone="success" title="Đã lưu hồ sơ thuế">
            Hệ thống sẽ dùng hồ sơ này để tự động lập tờ khai và tính thuế ở các tab
            khác.
          </Alert>
        )}

        {/* Stepper */}
        <Card title="🎯 Bước 1 — Chọn phương pháp tính thuế">
          <div style={{ fontSize: T.font.small, color: T.colors.textMuted, marginBottom: 12 }}>
            Theo TT 40/2021/TT-BTC và NĐ 70/2025/NĐ-CP, HKD/CNKD có 4 phương pháp tính
            thuế. Chọn phương pháp phù hợp với quy mô kinh doanh của bạn.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            {(Object.keys(TAX_METHOD_LABELS) as TaxMethod[]).map((m) => {
              const active = draft.method === m;
              return (
                <button
                  key={m}
                  onClick={() => update("method", m)}
                  style={{
                    textAlign: "left",
                    padding: 14,
                    borderRadius: T.radius.lg,
                    border: active
                      ? `2px solid ${T.colors.primary}`
                      : `1px solid ${T.colors.border}`,
                    background: active ? T.colors.primarySoft : T.colors.cardBg,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: T.colors.primaryDark,
                      marginBottom: 4,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{TAX_METHOD_LABELS[m]}</span>
                    {m === "declaration" && (
                      <Badge tone="info">Khuyến nghị</Badge>
                    )}
                  </div>
                  <div style={{ fontSize: T.font.tiny, color: T.colors.textMuted }}>
                    {TAX_METHOD_DESCRIPTIONS[m]}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div style={{ height: T.spacing.lg }} />

        <Card title="🏷️ Bước 2 — Chọn nhóm ngành nghề chính">
          <div
            style={{ fontSize: T.font.small, color: T.colors.textMuted, marginBottom: 12 }}
          >
            Nhóm ngành quyết định tỷ lệ % thuế GTGT và TNCN áp dụng cho doanh thu.
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {(Object.keys(INDUSTRY_GROUP_LABELS) as IndustryGroup[]).map((g) => {
              const active = draft.primaryIndustryGroup === g;
              const rate = TAX_RATES[g];
              return (
                <button
                  key={g}
                  onClick={() => update("primaryIndustryGroup", g)}
                  style={{
                    textAlign: "left",
                    padding: 12,
                    borderRadius: T.radius.md,
                    border: active
                      ? `2px solid ${T.colors.primary}`
                      : `1px solid ${T.colors.border}`,
                    background: active ? T.colors.primarySoft : T.colors.cardBg,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: T.colors.primaryDark,
                        fontSize: T.font.small,
                      }}
                    >
                      {INDUSTRY_GROUP_LABELS[g]}
                    </div>
                    <div
                      style={{
                        fontSize: T.font.tiny,
                        color: T.colors.textMuted,
                        marginTop: 2,
                      }}
                    >
                      Ví dụ: {INDUSTRY_GROUP_EXAMPLES[g].slice(0, 3).join(", ")}…
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      minWidth: 90,
                      fontSize: T.font.tiny,
                    }}
                  >
                    <div>
                      GTGT <b>{(rate.vat * 100).toFixed(1)}%</b>
                    </div>
                    <div>
                      TNCN <b>{(rate.pit * 100).toFixed(1)}%</b>
                    </div>
                    <div
                      style={{
                        color: T.colors.primary,
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      = {((rate.vat + rate.pit) * 100).toFixed(1)}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div style={{ height: T.spacing.lg }} />

        <Card title="📋 Bước 3 — Thông tin định danh & liên hệ">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <Field label="Mã số thuế (MST)" required>
              <input
                style={inputStyle}
                placeholder="8xxxxxxxxx hoặc 13 số"
                value={draft.taxCode}
                onChange={(e) => update("taxCode", e.target.value)}
              />
            </Field>
            <Field label="CCCD / CMND" required>
              <input
                style={inputStyle}
                value={draft.nationalId}
                onChange={(e) => update("nationalId", e.target.value)}
              />
            </Field>
            <Field label="Họ tên chủ hộ / cá nhân" required>
              <input
                style={inputStyle}
                value={draft.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </Field>
            <Field label="Tên cơ sở kinh doanh">
              <input
                style={inputStyle}
                value={draft.businessName ?? ""}
                onChange={(e) => update("businessName", e.target.value)}
              />
            </Field>
            <Field label="Số ĐKKD">
              <input
                style={inputStyle}
                value={draft.businessRegistrationNo ?? ""}
                onChange={(e) =>
                  update("businessRegistrationNo", e.target.value)
                }
              />
            </Field>
            <Field label="Điện thoại">
              <input
                style={inputStyle}
                value={draft.phone ?? ""}
                onChange={(e) => update("phone", e.target.value)}
              />
            </Field>
            <Field label="Địa chỉ" required>
              <input
                style={inputStyle}
                value={draft.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </Field>
            <Field label="Tỉnh / Thành phố" required>
              <input
                style={inputStyle}
                value={draft.province}
                onChange={(e) => update("province", e.target.value)}
              />
            </Field>
            <Field label="Kỳ khai">
              <select
                style={inputStyle}
                value={draft.periodKind}
                onChange={(e) =>
                  update("periodKind", e.target.value as TaxPeriodKind)
                }
              >
                {Object.entries(PERIOD_KIND_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ngân hàng nộp thuế">
              <input
                style={inputStyle}
                placeholder="VD: Vietcombank - 0123456789"
                value={`${draft.bankName ?? ""}${
                  draft.bankAccountNo ? " - " + draft.bankAccountNo : ""
                }`}
                onChange={(e) => {
                  const [name, acc] = e.target.value.split(" - ");
                  setDraft({
                    ...draft,
                    bankName: name,
                    bankAccountNo: acc ?? "",
                  });
                }}
              />
            </Field>
            <Field
              label="Đã dùng máy tính tiền kết nối TCT?"
              hint="Bắt buộc nếu >1 tỷ/năm ngành F&B, bán lẻ (NĐ 70/2025)"
            >
              <select
                style={inputStyle}
                value={draft.usesCashRegister ? "yes" : "no"}
                onChange={(e) =>
                  update("usesCashRegister", e.target.value === "yes")
                }
              >
                <option value="no">Chưa</option>
                <option value="yes">Có</option>
              </select>
            </Field>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: T.spacing.lg,
              justifyContent: "flex-end",
            }}
          >
            <Button variant="ghost" onClick={() => setDraft(defaultProfile())}>
              Làm mới
            </Button>
            <Button variant="primary" size="lg" onClick={handleSave}>
              💾 Lưu hồ sơ thuế
            </Button>
          </div>
        </Card>
      </div>

      {/* Sidebar — preview */}
      <div>
        <Card title="🔍 Preview hồ sơ" subtitle="Xem nhanh cấu hình hiện tại">
          <KV label="Phương pháp" value={TAX_METHOD_LABELS[draft.method]} />
          <KV label="Kỳ khai" value={PERIOD_KIND_LABELS[draft.periodKind]} />
          <KV
            label="Ngành"
            value={
              <span style={{ fontSize: 11 }}>
                {INDUSTRY_GROUP_LABELS[draft.primaryIndustryGroup]}
              </span>
            }
          />
          <KV
            label="Tỷ lệ thuế"
            value={
              <Badge tone="info">
                {(
                  (TAX_RATES[draft.primaryIndustryGroup].vat +
                    TAX_RATES[draft.primaryIndustryGroup].pit) *
                  100
                ).toFixed(1)}
                %
              </Badge>
            }
          />
          <KV label="MST" value={draft.taxCode || "—"} />
          <KV label="Tên" value={draft.fullName || "—"} />
          <KV label="Tỉnh/TP" value={draft.province || "—"} />
        </Card>

        <div style={{ height: 12 }} />

        <Card title="💡 Mẹo chọn phương pháp">
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              fontSize: T.font.small,
              color: T.colors.textMain,
              lineHeight: 1.6,
            }}
          >
            <li>
              Doanh thu &lt; 100tr/năm → <b>miễn thuế GTGT+TNCN+môn bài</b>
            </li>
            <li>Doanh thu ổn định, ít biến động → chọn <b>Khoán</b></li>
            <li>Doanh thu biến động, bán online → chọn <b>Kê khai</b></li>
            <li>
              F&B/bán lẻ &gt; 1 tỷ → buộc <b>máy tính tiền kết nối TCT</b>
            </li>
            <li>
              &gt; 3 tỷ → buộc chuyển <b>Kê khai</b>
            </li>
          </ul>
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
      <span
        style={{
          color: T.colors.primaryDark,
          fontWeight: 600,
          textAlign: "right",
          maxWidth: "60%",
        }}
      >
        {value}
      </span>
    </div>
  );
}
