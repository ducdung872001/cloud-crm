// Tax Engine — thuần logic, không phụ thuộc framework.
// Chia thành 4 thành phần: TaxCalculator, DeclarationBuilder, ThresholdChecker, DeadlineHelper.

import {
  TAX_RATES,
  REVENUE_THRESHOLDS,
  CASH_REGISTER_REQUIRED_INDUSTRIES,
  FORM_CODES,
  DEADLINE_RULES,
} from "./constants";
import type {
  IndustryGroup,
  TaxpayerProfile,
  RevenueRecord,
  ExpenseRecord,
  TaxPeriod,
  TaxBreakdown,
  TaxCalculationResult,
  TaxDeclaration,
  ThresholdWarning,
  TaxPeriodKind,
} from "./types";

// ═══ TAX CALCULATOR ═══════════════════════════════════════════════════════
export class TaxCalculator {
  /**
   * Tính thuế cho một kỳ dựa trên danh sách doanh thu + chi phí.
   * Áp dụng cho cả 2 phương pháp "khoán" và "kê khai" (cùng công thức tỷ lệ %).
   * Sự khác biệt chỉ nằm ở kỳ khai và nguồn dữ liệu.
   */
  calculate(params: {
    period: TaxPeriod;
    taxpayer: TaxpayerProfile;
    revenues: RevenueRecord[];
    expenses?: ExpenseRecord[];
    specialConsumptionTax?: number;
    resourceTax?: number;
    environmentFee?: number;
  }): TaxCalculationResult {
    const { period, taxpayer, revenues, expenses = [] } = params;

    // Lọc doanh thu thuộc kỳ + chịu thuế
    const taxableRevenues = revenues.filter(
      (r) =>
        r.isTaxable &&
        r.occurredAt >= period.startDate &&
        r.occurredAt <= period.endDate
    );

    // Nhóm theo industryGroup để lên đúng 4 dòng của mẫu 01/CNKD
    const grouped = new Map<IndustryGroup, number>();
    for (const rev of taxableRevenues) {
      grouped.set(
        rev.industryGroup,
        (grouped.get(rev.industryGroup) ?? 0) + rev.amount
      );
    }

    // Nếu không có dữ liệu, dùng industryGroup mặc định của taxpayer
    if (grouped.size === 0) {
      grouped.set(taxpayer.primaryIndustryGroup, 0);
    }

    const breakdowns: TaxBreakdown[] = [];
    let totalVat = 0;
    let totalPit = 0;
    let totalRevenue = 0;

    const entries = Array.from(grouped.entries()) as Array<[IndustryGroup, number]>;
    for (const [group, taxableRevenue] of entries) {
      const rate = TAX_RATES[group];
      const vatAmount = Math.round(taxableRevenue * rate.vat);
      const pitAmount = Math.round(taxableRevenue * rate.pit);
      breakdowns.push({
        industryGroup: group,
        taxableRevenue,
        vatRate: rate.vat,
        pitRate: rate.pit,
        vatAmount,
        pitAmount,
        totalAmount: vatAmount + pitAmount,
      });
      totalVat += vatAmount;
      totalPit += pitAmount;
      totalRevenue += taxableRevenue;
    }

    // Chi phí khấu trừ (chỉ hiển thị cho phương pháp kê khai, không làm giảm thuế theo tỷ lệ %)
    const totalDeductibleExpense = expenses
      .filter(
        (e) => e.occurredAt >= period.startDate && e.occurredAt <= period.endDate
      )
      .reduce((sum, e) => sum + e.amount, 0);

    const specialConsumptionTax = params.specialConsumptionTax ?? 0;
    const resourceTax = params.resourceTax ?? 0;
    const environmentFee = params.environmentFee ?? 0;

    // Môn bài chỉ tính 1 lần/năm — gắn với kỳ year
    const licenseFee =
      period.kind === "year" ? this.calcLicenseFee(totalRevenue) : 0;

    const totalTaxPayable =
      totalVat +
      totalPit +
      specialConsumptionTax +
      resourceTax +
      environmentFee +
      licenseFee;

    return {
      periodId: period.id,
      totalRevenue,
      totalDeductibleExpense,
      breakdowns,
      totalVat,
      totalPit,
      specialConsumptionTax,
      resourceTax,
      environmentFee,
      licenseFee,
      totalTaxPayable,
      estimatedProfit: totalRevenue - totalDeductibleExpense - totalTaxPayable,
    };
  }

  calcLicenseFee(annualRevenue: number): number {
    if (annualRevenue <= REVENUE_THRESHOLDS.vatExemption) return 0;
    for (const band of REVENUE_THRESHOLDS.licenseFeeBands) {
      if (annualRevenue <= band.max) return band.fee;
    }
    return 0;
  }
}

// ═══ THRESHOLD CHECKER ════════════════════════════════════════════════════
export class ThresholdChecker {
  check(
    annualRevenue: number,
    taxpayer: TaxpayerProfile
  ): ThresholdWarning[] {
    const warnings: ThresholdWarning[] = [];
    const exemption = REVENUE_THRESHOLDS.vatExemption;

    if (annualRevenue > exemption * 0.8 && annualRevenue <= exemption) {
      warnings.push({
        code: "near_exemption",
        severity: "info",
        message: `Bạn đang đạt ${Math.round(
          (annualRevenue / exemption) * 100
        )}% ngưỡng miễn thuế 100 triệu/năm. Tiếp tục theo dõi để kịp thời lập tờ khai khi vượt.`,
      });
    }

    if (annualRevenue > exemption) {
      warnings.push({
        code: "crossed_exemption",
        severity: "warning",
        message:
          "Doanh thu đã vượt 100 triệu/năm — bắt đầu phát sinh nghĩa vụ nộp GTGT, TNCN và lệ phí môn bài.",
        actionLabel: "Lập tờ khai",
      });
    }

    if (
      annualRevenue > REVENUE_THRESHOLDS.cashRegisterRequired &&
      CASH_REGISTER_REQUIRED_INDUSTRIES.includes(taxpayer.primaryIndustryGroup) &&
      !taxpayer.usesCashRegister
    ) {
      warnings.push({
        code: "must_use_cash_register",
        severity: "critical",
        message:
          "Theo NĐ 70/2025, ngành của bạn vượt 1 tỷ/năm buộc phải dùng máy tính tiền kết nối dữ liệu trực tiếp với cơ quan thuế.",
        actionLabel: "Liên hệ đơn vị cung cấp",
      });
    }

    if (annualRevenue > REVENUE_THRESHOLDS.mustSwitchToDeclaration) {
      warnings.push({
        code: "must_switch_to_declaration",
        severity: "critical",
        message:
          "Doanh thu vượt 3 tỷ/năm — buộc chuyển sang phương pháp kê khai thực tế, không còn áp dụng khoán.",
        actionLabel: "Chuyển phương pháp",
      });
    }

    return warnings;
  }
}

// ═══ DECLARATION BUILDER ══════════════════════════════════════════════════
export class DeclarationBuilder {
  /**
   * Build TaxDeclaration từ kết quả tính thuế — chuẩn bị sẵn XML-ready structure
   * cho mẫu 01/CNKD (và phụ lục 01-2/BK-HDKD nếu phương pháp kê khai).
   */
  build(params: {
    taxpayer: TaxpayerProfile;
    period: TaxPeriod;
    calculation: TaxCalculationResult;
  }): TaxDeclaration {
    const { taxpayer, period, calculation } = params;
    const formCode =
      taxpayer.method === "declaration"
        ? FORM_CODES.MAIN_01_CNKD // vẫn dùng 01/CNKD + phụ lục
        : FORM_CODES.MAIN_01_CNKD;

    const id = `DCL-${period.id}-${Date.now()}`;
    const now = new Date().toISOString();

    return {
      id,
      formCode,
      taxpayerId: taxpayer.id,
      period,
      method: taxpayer.method,
      calculation,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      xmlPayload: this.buildXmlPayload(taxpayer, period, calculation),
    };
  }

  /**
   * Build XML chuẩn theo schema mẫu 01/CNKD của TCT.
   * Đây là stub — schema thật cần đối chiếu với tài liệu SOAP của TCT.
   * Nhưng cấu trúc field đã theo đúng bố cục mẫu giấy để khi có schema chỉ cần đổi tag.
   */
  buildXmlPayload(
    taxpayer: TaxpayerProfile,
    period: TaxPeriod,
    calc: TaxCalculationResult
  ): string {
    const checkboxMap = {
      presumptive: "HKDKhoan",
      declaration: "HKDKeKhai",
      per_occurrence: "CNKDTungLan",
      on_behalf: "KhaiThay",
    };

    const breakdownXml = calc.breakdowns
      .map(
        (b) => `
      <NhomNganhNghe code="${b.industryGroup}">
        <DoanhThu>${b.taxableRevenue}</DoanhThu>
        <TyLeGTGT>${b.vatRate}</TyLeGTGT>
        <ThueGTGT>${b.vatAmount}</ThueGTGT>
        <TyLeTNCN>${b.pitRate}</TyLeTNCN>
        <ThueTNCN>${b.pitAmount}</ThueTNCN>
      </NhomNganhNghe>`
      )
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<HSoThueDTu>
  <HSoKhaiThue>
    <TTinChung>
      <TTinTKhaiThue>
        <maTKhai>${FORM_CODES.MAIN_01_CNKD}</maTKhai>
        <phuongPhapKhai>${checkboxMap[taxpayer.method]}</phuongPhapKhai>
        <kyKKhaiThue>
          <kieuKy>${period.kind}</kieuKy>
          <tuNgay>${period.startDate}</tuNgay>
          <denNgay>${period.endDate}</denNgay>
        </kyKKhaiThue>
      </TTinTKhaiThue>
      <NNT>
        <mst>${taxpayer.taxCode}</mst>
        <tenNNT>${escapeXml(taxpayer.fullName)}</tenNNT>
        <cmnd>${taxpayer.nationalId}</cmnd>
        <dchiNNT>${escapeXml(taxpayer.address)}</dchiNNT>
        <tinhNNT>${escapeXml(taxpayer.province)}</tinhNNT>
        <dthoaiNNT>${taxpayer.phone ?? ""}</dthoaiNNT>
      </NNT>
    </TTinChung>
    <CTieuTKhaiChinh>
      <TongDoanhThu code="32">${calc.totalRevenue}</TongDoanhThu>
      <NhomNganhNgheList>${breakdownXml}
      </NhomNganhNgheList>
      <TongThueGTGT>${calc.totalVat}</TongThueGTGT>
      <TongThueTNCN>${calc.totalPit}</TongThueTNCN>
      <ThueTTDB code="33">${calc.specialConsumptionTax}</ThueTTDB>
      <ThueTaiNguyen code="34">${calc.resourceTax}</ThueTaiNguyen>
      <PhiBVMT code="35">${calc.environmentFee}</PhiBVMT>
      <TongThuePhaiNop>${calc.totalTaxPayable}</TongThuePhaiNop>
    </CTieuTKhaiChinh>
  </HSoKhaiThue>
</HSoThueDTu>`;
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ═══ DEADLINE HELPER ══════════════════════════════════════════════════════
export class DeadlineHelper {
  /**
   * Tính ngày tạo TaxPeriod cho kỳ hiện tại dựa trên phương pháp + kỳ của taxpayer.
   */
  buildCurrentPeriod(taxpayer: TaxpayerProfile, referenceDate = new Date()): TaxPeriod {
    const kind = taxpayer.periodKind;
    if (kind === "month") return this.buildMonthPeriod(referenceDate);
    if (kind === "quarter") return this.buildQuarterPeriod(referenceDate);
    if (kind === "year") return this.buildYearPeriod(referenceDate);
    return this.buildOccurrencePeriod(referenceDate);
  }

  buildMonthPeriod(ref: Date): TaxPeriod {
    const y = ref.getFullYear();
    const m = ref.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    const due = new Date(y, m + 1, DEADLINE_RULES.monthlyDueDayOfNextMonth);
    return {
      id: `month-${y}-${String(m + 1).padStart(2, "0")}`,
      kind: "month",
      label: `Tháng ${String(m + 1).padStart(2, "0")}/${y}`,
      startDate: isoDate(start),
      endDate: isoDate(end),
      dueDate: isoDate(due),
      status: "draft",
    };
  }

  buildQuarterPeriod(ref: Date): TaxPeriod {
    const y = ref.getFullYear();
    const q = Math.floor(ref.getMonth() / 3);
    const start = new Date(y, q * 3, 1);
    const end = new Date(y, q * 3 + 3, 0);
    const due = new Date(y, q * 3 + 3, 31);
    return {
      id: `quarter-${y}-Q${q + 1}`,
      kind: "quarter",
      label: `Quý ${q + 1}/${y}`,
      startDate: isoDate(start),
      endDate: isoDate(end),
      dueDate: isoDate(due),
      status: "draft",
    };
  }

  buildYearPeriod(ref: Date): TaxPeriod {
    const y = ref.getFullYear();
    return {
      id: `year-${y}`,
      kind: "year",
      label: `Năm ${y}`,
      startDate: `${y}-01-01`,
      endDate: `${y}-12-31`,
      dueDate: `${y + 1}-03-31`,
      status: "draft",
    };
  }

  buildOccurrencePeriod(ref: Date): TaxPeriod {
    const d = isoDate(ref);
    return {
      id: `occ-${d}`,
      kind: "occurrence",
      label: `Phát sinh ngày ${d}`,
      startDate: d,
      endDate: d,
      dueDate: d,
      status: "draft",
    };
  }

  /** Build danh sách kỳ cho cả năm — dùng cho Tax Calendar */
  buildYearCalendar(taxpayer: TaxpayerProfile, year: number): TaxPeriod[] {
    const kind = taxpayer.periodKind;
    if (kind === "month") {
      return Array.from({ length: 12 }, (_, i) =>
        this.buildMonthPeriod(new Date(year, i, 15))
      );
    }
    if (kind === "quarter") {
      return Array.from({ length: 4 }, (_, i) =>
        this.buildQuarterPeriod(new Date(year, i * 3 + 1, 15))
      );
    }
    return [this.buildYearPeriod(new Date(year, 6, 1))];
  }

  /** Số ngày còn lại đến deadline, âm nếu đã quá hạn */
  daysUntilDue(period: TaxPeriod, today = new Date()): number {
    const due = new Date(period.dueDate);
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}

function isoDate(d: Date): string {
  // Dùng local Y/M/D thay vì toISOString() — tránh lệch timezone cho VN (UTC+7).
  // `new Date(y, m, 1)` tạo giờ local midnight; toISOString() sẽ shift về ngày hôm trước.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ═══ FACADE ═══════════════════════════════════════════════════════════════
export const taxEngine = {
  calculator: new TaxCalculator(),
  thresholdChecker: new ThresholdChecker(),
  declarationBuilder: new DeclarationBuilder(),
  deadlineHelper: new DeadlineHelper(),
};
