// Q3 — Preview mẫu 03/CNKD (Quyết toán kết quả kinh doanh).
// Dùng cho HKD/CNKD phương pháp kê khai, nộp 1 lần/năm sau khi kết thúc năm.
//
// Bố cục chính:
//  A. Doanh thu thực tế theo nhóm ngành
//  B. Chi phí được trừ (bảng kê 01-2/BK-HDKD)
//  C. Lãi/lỗ thực tế
//  D. Thuế TNCN tính trên tỷ lệ % doanh thu (vẫn theo TT40)
//  E. So sánh với tạm tính đã nộp trong năm (01/CNKD hàng tháng/quý)
//  F. Thuế phải nộp thêm / hoàn lại
//
// Lưu ý: tài liệu không cung cấp file mẫu 03/CNKD nên layout dưới đây
// dựa trên logic nghiệp vụ + cấu trúc của 01/CNKD. Khi có file mẫu
// thật cần đối chiếu lại.

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

export default function DeclarationPreview03({
  taxpayer,
  period,
  calculation,
  supplementNumber = 0,
  provisionalPaid = 0, // số thuế đã tạm nộp từ các tờ khai 01/CNKD trong năm
}: {
  taxpayer: TaxpayerProfile;
  period: TaxPeriod;
  calculation: TaxCalculationResult;
  supplementNumber?: number;
  provisionalPaid?: number;
}) {
  const byGroup = new Map(
    calculation.breakdowns.map((b) => [b.industryGroup, b])
  );
  const isSupplement = supplementNumber > 0;
  const taxDiff = calculation.totalTaxPayable - provisionalPaid;

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
      <div style={{ textAlign: "right", fontSize: 11, marginBottom: 8 }}>
        Mẫu số: <b>{FORM_CODES.ACTUAL_03_CNKD}</b>
        <br />
        (Ban hành kèm theo TT số 40/2021/TT-BTC)
      </div>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>
          CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </div>
        <div style={{ fontWeight: 700 }}>Độc lập - Tự do - Hạnh phúc</div>
        <div style={{ margin: "4px 0" }}>────────────────</div>
        <h2 style={{ margin: "8px 0", fontSize: 16 }}>
          TỜ KHAI QUYẾT TOÁN KẾT QUẢ KINH DOANH
          <br />
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            (Dành cho hộ kinh doanh, cá nhân kinh doanh nộp thuế theo phương
            pháp kê khai)
          </span>
        </h2>
      </div>

      <div style={{ marginBottom: 10 }}>
        <b>[01] Kỳ quyết toán năm:</b> {period.label}
      </div>
      <div style={{ marginBottom: 10 }}>
        <b>[02] Lần đầu:</b> {isSupplement ? "☐" : "☒"} &nbsp;&nbsp;{" "}
        <b>Bổ sung lần thứ:</b>{" "}
        {isSupplement ? (
          <span
            style={{
              display: "inline-block",
              minWidth: 20,
              borderBottom: "1px solid #000",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            {supplementNumber}
          </span>
        ) : (
          "☐"
        )}
      </div>

      <div style={{ border: "1px solid #000", padding: 10, marginBottom: 14, fontSize: 12 }}>
        <Row label="[03] Tên người nộp thuế" value={taxpayer.fullName || "—"} />
        <Row label="[04] Mã số thuế" value={taxpayer.taxCode || "—"} />
        <Row
          label="[05] Địa chỉ"
          value={`${taxpayer.address}, ${taxpayer.province}`}
        />
        <Row label="[06] Phương pháp" value={TAX_METHOD_LABELS[taxpayer.method]} />
      </div>

      <div style={{ fontStyle: "italic", marginBottom: 8 }}>
        Đơn vị tiền: Đồng Việt Nam
      </div>

      {/* Phần A — Doanh thu thực tế */}
      <div style={{ fontWeight: 700, marginBottom: 4 }}>
        A. DOANH THU THỰC TẾ CẢ NĂM
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
            <th style={cellTh}>STT</th>
            <th style={cellTh}>Nhóm ngành nghề</th>
            <th style={cellTh}>Doanh thu thực tế</th>
            <th style={cellTh}>Tỷ lệ TNCN</th>
            <th style={cellTh}>Thuế TNCN [20]</th>
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
                  {row ? (row.pitRate * 100).toFixed(1) + "%" : "—"}
                </td>
                <td style={cellTdNum}>{row ? formatVND(row.pitAmount) : ""}</td>
              </tr>
            );
          })}
          <tr style={{ background: "#fafafa", fontWeight: 700 }}>
            <td style={cellTd} colSpan={2}>
              Tổng cộng [21]
            </td>
            <td style={cellTdNum}>{formatVND(calculation.totalRevenue)}</td>
            <td style={cellTdNum}></td>
            <td style={cellTdNum}>{formatVND(calculation.totalPit)}</td>
          </tr>
        </tbody>
      </table>

      {/* Phần B — Chi phí */}
      <div style={{ fontWeight: 700, marginBottom: 4 }}>
        B. CHI PHÍ ĐƯỢC TRỪ TRONG NĂM
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
          label="[22] Tổng chi phí quản lý (bảng kê 01-2/BK-HDKD)"
          value={formatVND(calculation.totalDeductibleExpense) + " đ"}
        />
        <div
          style={{
            marginTop: 6,
            fontStyle: "italic",
            fontSize: 11,
            color: "#666",
          }}
        >
          * Chi tiết: nhân công, điện, nước, viễn thông, thuê mặt bằng, quản lý,
          khác — xem phụ lục 01-2/BK-HDKD.
        </div>
      </div>

      {/* Phần C — Kết quả */}
      <div style={{ fontWeight: 700, marginBottom: 4 }}>
        C. KẾT QUẢ KINH DOANH
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
          label="[23] Doanh thu"
          value={formatVND(calculation.totalRevenue) + " đ"}
        />
        <Row
          label="[24] Chi phí"
          value={formatVND(calculation.totalDeductibleExpense) + " đ"}
        />
        <Row
          label="[25] Lợi nhuận trước thuế [23] - [24]"
          value={
            formatVND(
              calculation.totalRevenue - calculation.totalDeductibleExpense
            ) + " đ"
          }
        />
      </div>

      {/* Phần D — Thuế phải nộp + đối chiếu tạm tính */}
      <div style={{ fontWeight: 700, marginBottom: 4 }}>
        D. THUẾ PHẢI NỘP & ĐỐI CHIẾU TẠM TÍNH
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
          label="[26] Tổng thuế GTGT"
          value={formatVND(calculation.totalVat) + " đ"}
        />
        <Row
          label="[27] Tổng thuế TNCN"
          value={formatVND(calculation.totalPit) + " đ"}
        />
        <Row
          label="[28] Lệ phí môn bài"
          value={formatVND(calculation.licenseFee) + " đ"}
        />
        <Row
          label="[29] Tổng phải nộp cả năm [26]+[27]+[28]"
          value={formatVND(calculation.totalTaxPayable) + " đ"}
        />
        <Row
          label="[30] Đã tạm nộp trong năm (từ 01/CNKD)"
          value={formatVND(provisionalPaid) + " đ"}
        />
        <div
          style={{
            marginTop: 8,
            padding: 8,
            background: taxDiff >= 0 ? "#FEF2F2" : "#F0FDF4",
            borderRadius: 4,
            fontWeight: 700,
          }}
        >
          {taxDiff >= 0 ? (
            <>
              [31] CÒN PHẢI NỘP THÊM:{" "}
              <span style={{ color: "#B91C1C" }}>
                {formatVND(taxDiff)} đ
              </span>
            </>
          ) : (
            <>
              [32] ĐƯỢC HOÀN / BÙ TRỪ:{" "}
              <span style={{ color: "#15803D" }}>
                {formatVND(Math.abs(taxDiff))} đ
              </span>
            </>
          )}
        </div>
      </div>

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
          marginTop: 14,
          fontSize: 10,
          color: "#666",
          fontStyle: "italic",
        }}
      >
        Phương pháp: {TAX_METHOD_LABELS[taxpayer.method]} · Ngành chính:{" "}
        {INDUSTRY_GROUP_LABELS[taxpayer.primaryIndustryGroup]}
        <br />
        ⚠ Layout 03/CNKD dựa trên logic nghiệp vụ — cần đối chiếu file mẫu thật
        của TCT khi có.
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
      <span style={{ minWidth: 260, fontWeight: 600 }}>{label}:</span>
      <span>{value}</span>
    </div>
  );
}
