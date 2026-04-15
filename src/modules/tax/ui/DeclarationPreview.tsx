// Preview mẫu 01/CNKD — render layout chuẩn giống tờ khai giấy để người dùng
// xem trước trước khi ký và nộp. Có thể in trực tiếp bằng window.print().

import React from "react";
import { taxTheme as T } from "./theme";
import { formatVND } from "./common";
import {
  INDUSTRY_GROUP_LABELS,
  TAX_METHOD_LABELS,
  FORM_CODES,
} from "../domain/constants";
import type {
  TaxpayerProfile,
  TaxPeriod,
  TaxCalculationResult,
  IndustryGroup,
} from "../domain/types";

// Thứ tự 4 dòng trên mẫu 01/CNKD (không tính asset_lease — sheet riêng)
const FORM_ROW_ORDER: IndustryGroup[] = [
  "distribution",
  "service_no_material",
  "production_transport",
  "other_business",
];

const ROW_SHORT_LABELS: Record<IndustryGroup, string> = {
  distribution: "1. Phân phối, cung cấp hàng hoá",
  service_no_material: "2. Dịch vụ, xây dựng không bao thầu NVL",
  production_transport: "3. Sản xuất, vận tải, DV gắn HH, XD có bao thầu NVL",
  other_business: "4. Hoạt động kinh doanh khác",
  asset_lease: "5. Cho thuê tài sản",
};

export default function DeclarationPreview({
  taxpayer,
  period,
  calculation,
}: {
  taxpayer: TaxpayerProfile;
  period: TaxPeriod;
  calculation: TaxCalculationResult;
}) {
  const byGroup = new Map(
    calculation.breakdowns.map((b) => [b.industryGroup, b])
  );

  return (
    <div
      style={{
        background: "#fff",
        padding: 32,
        borderRadius: T.radius.lg,
        fontFamily: "'Times New Roman', Times, serif",
        color: "#000",
        fontSize: 13,
        lineHeight: 1.5,
        border: `1px solid ${T.colors.border}`,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "right", fontSize: 11, marginBottom: 8 }}>
        Mẫu số: <b>{FORM_CODES.MAIN_01_CNKD}</b>
        <br />
        (Ban hành kèm theo TT số 40/2021/TT-BTC ngày 01/6/2021)
      </div>
      <div
        style={{
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15 }}>
          CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </div>
        <div style={{ fontWeight: 700 }}>Độc lập - Tự do - Hạnh phúc</div>
        <div style={{ margin: "4px 0" }}>────────────────</div>
        <h2 style={{ margin: "8px 0", fontSize: 17 }}>
          TỜ KHAI THUẾ ĐỐI VỚI HỘ KINH DOANH, CÁ NHÂN KINH DOANH
        </h2>
      </div>

      {/* Checkboxes phương pháp */}
      <div style={{ marginBottom: 12, fontSize: 12 }}>
        <Check
          checked={taxpayer.method === "presumptive"}
          label="Hộ kinh doanh, cá nhân kinh doanh nộp thuế theo phương pháp khoán"
        />
        <Check
          checked={taxpayer.method === "per_occurrence"}
          label="Cá nhân kinh doanh nộp thuế theo từng lần phát sinh"
        />
        <Check
          checked={taxpayer.method === "on_behalf"}
          label="Tổ chức, cá nhân khai thay, nộp thay cho cá nhân"
        />
        <Check
          checked={taxpayer.method === "declaration"}
          label="Hộ kinh doanh, cá nhân kinh doanh nộp thuế theo phương pháp kê khai"
        />
      </div>

      {/* Kỳ & NNT */}
      <div style={{ marginBottom: 10 }}>
        <b>[01] Kỳ tính thuế:</b> {period.label} (Từ {period.startDate} đến{" "}
        {period.endDate})
      </div>
      <div style={{ marginBottom: 10 }}>
        <b>[02] Lần đầu:</b> ☒ &nbsp;&nbsp; <b>Bổ sung lần thứ:</b> ☐
      </div>

      <div
        style={{
          border: "1px solid #000",
          padding: 10,
          marginBottom: 14,
          fontSize: 12,
        }}
      >
        <Row
          label="[03] Tên người nộp thuế"
          value={taxpayer.fullName || taxpayer.businessName || "(chưa nhập)"}
        />
        <Row label="[04] Mã số thuế" value={taxpayer.taxCode || "(chưa có)"} />
        <Row
          label="[05] Địa chỉ"
          value={`${taxpayer.address || ""}, ${taxpayer.province || ""}`}
        />
        <Row label="[06] Điện thoại" value={taxpayer.phone || "—"} />
        <Row label="[07] CCCD/CMND" value={taxpayer.nationalId || "—"} />
      </div>

      <div style={{ fontStyle: "italic", marginBottom: 8 }}>
        Đơn vị tiền: Đồng Việt Nam
      </div>

      {/* Phần A — Bảng 4 nhóm ngành */}
      <div style={{ fontWeight: 700, marginBottom: 4 }}>
        A. THUẾ GIÁ TRỊ GIA TĂNG VÀ THUẾ THU NHẬP CÁ NHÂN
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 11,
          marginBottom: 14,
        }}
      >
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={cellTh} rowSpan={2}>
              STT
            </th>
            <th style={cellTh} rowSpan={2}>
              Nhóm ngành nghề
            </th>
            <th style={cellTh} rowSpan={2}>
              Doanh thu
              <br />
              [26]
            </th>
            <th style={cellTh} colSpan={2}>
              Thuế GTGT
            </th>
            <th style={cellTh} colSpan={2}>
              Thuế TNCN
            </th>
          </tr>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={cellTh}>Tỷ lệ</th>
            <th style={cellTh}>Số thuế [29]</th>
            <th style={cellTh}>Tỷ lệ</th>
            <th style={cellTh}>Số thuế [31]</th>
          </tr>
        </thead>
        <tbody>
          {FORM_ROW_ORDER.map((g, i) => {
            const row = byGroup.get(g);
            return (
              <tr key={g}>
                <td style={cellTd}>{i + 1}</td>
                <td style={{ ...cellTd, textAlign: "left" }}>
                  {ROW_SHORT_LABELS[g]}
                </td>
                <td style={cellTdNum}>
                  {row ? formatVND(row.taxableRevenue) : ""}
                </td>
                <td style={cellTdNum}>
                  {row ? (row.vatRate * 100).toFixed(1) + "%" : "—"}
                </td>
                <td style={cellTdNum}>
                  {row ? formatVND(row.vatAmount) : ""}
                </td>
                <td style={cellTdNum}>
                  {row ? (row.pitRate * 100).toFixed(1) + "%" : "—"}
                </td>
                <td style={cellTdNum}>
                  {row ? formatVND(row.pitAmount) : ""}
                </td>
              </tr>
            );
          })}
          <tr style={{ background: "#fafafa", fontWeight: 700 }}>
            <td style={cellTd} colSpan={2}>
              Tổng cộng [32]
            </td>
            <td style={cellTdNum}>{formatVND(calculation.totalRevenue)}</td>
            <td style={cellTdNum}></td>
            <td style={cellTdNum}>{formatVND(calculation.totalVat)}</td>
            <td style={cellTdNum}></td>
            <td style={cellTdNum}>{formatVND(calculation.totalPit)}</td>
          </tr>
        </tbody>
      </table>

      {/* Phần B — TTĐB */}
      <div style={{ fontWeight: 700, marginBottom: 4 }}>
        B. THUẾ TIÊU THỤ ĐẶC BIỆT
      </div>
      <Row
        label="[33] Số thuế TTĐB phải nộp"
        value={formatVND(calculation.specialConsumptionTax) + " đ"}
      />

      {/* Phần C — Tài nguyên + BVMT */}
      <div style={{ fontWeight: 700, marginTop: 10, marginBottom: 4 }}>
        C. THUẾ TÀI NGUYÊN, PHÍ BẢO VỆ MÔI TRƯỜNG
      </div>
      <Row
        label="[34] Thuế tài nguyên"
        value={formatVND(calculation.resourceTax) + " đ"}
      />
      <Row
        label="[35] Phí bảo vệ môi trường"
        value={formatVND(calculation.environmentFee) + " đ"}
      />

      {/* Tổng */}
      <div
        style={{
          marginTop: 14,
          padding: 10,
          border: "2px solid #000",
          background: "#fafafa",
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        <span>TỔNG SỐ THUẾ PHẢI NỘP</span>
        <span>{formatVND(calculation.totalTaxPayable)} đ</span>
      </div>

      {/* Chân ký */}
      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          fontSize: 11,
        }}
      >
        <div />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontStyle: "italic" }}>
            ……, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1}{" "}
            năm {new Date().getFullYear()}
          </div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>
            NGƯỜI NỘP THUẾ hoặc ĐẠI DIỆN HỢP PHÁP
          </div>
          <div style={{ fontStyle: "italic" }}>(Ký, ghi rõ họ tên)</div>
          <div style={{ marginTop: 40, fontWeight: 700 }}>
            {taxpayer.fullName || "____________________"}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          fontSize: 10,
          color: "#666",
          fontStyle: "italic",
        }}
      >
        Phương pháp: {TAX_METHOD_LABELS[taxpayer.method]} · Ngành chính:{" "}
        {INDUSTRY_GROUP_LABELS[taxpayer.primaryIndustryGroup]}
      </div>
    </div>
  );
}

const cellTh: React.CSSProperties = {
  border: "1px solid #000",
  padding: "6px 4px",
  textAlign: "center",
  fontWeight: 700,
};
const cellTd: React.CSSProperties = {
  border: "1px solid #000",
  padding: "6px 4px",
  textAlign: "center",
};
const cellTdNum: React.CSSProperties = {
  ...cellTd,
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "2px 0" }}>
      <span style={{ minWidth: 180, fontWeight: 600 }}>{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function Check({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div style={{ padding: "2px 0" }}>
      <span
        style={{
          display: "inline-block",
          width: 14,
          height: 14,
          border: "1.5px solid #000",
          textAlign: "center",
          lineHeight: "12px",
          marginRight: 8,
          fontSize: 12,
        }}
      >
        {checked ? "✕" : ""}
      </span>
      {label}
    </div>
  );
}
