// Vitest unit tests cho domain layer của tax module.
// Chạy: npx vitest run src/modules/tax/domain/__tests__

import { describe, it, expect } from "vitest";
import {
  TaxCalculator,
  ThresholdChecker,
  DeclarationBuilder,
  DeadlineHelper,
} from "../engine";
import type {
  TaxpayerProfile,
  TaxPeriod,
  RevenueRecord,
  IndustryGroup,
} from "../types";

// ═══ Test fixtures ════════════════════════════════════════════════════════
function mkProfile(overrides: Partial<TaxpayerProfile> = {}): TaxpayerProfile {
  return {
    id: "tp-test",
    taxCode: "8123456789",
    fullName: "Nguyễn Văn Test",
    nationalId: "001234567890",
    address: "123 Phố Test",
    province: "Hà Nội",
    method: "presumptive",
    periodKind: "year",
    primaryIndustryGroup: "service_no_material",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function mkPeriod(overrides: Partial<TaxPeriod> = {}): TaxPeriod {
  return {
    id: "test-period",
    kind: "month",
    label: "Tháng 03/2026",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    dueDate: "2026-04-20",
    status: "draft",
    ...overrides,
  };
}

function mkRevenue(
  amount: number,
  industryGroup: IndustryGroup,
  dateIso = "2026-03-15T10:00:00Z",
  isTaxable = true
): RevenueRecord {
  return {
    id: `r-${Math.random()}`,
    occurredAt: dateIso,
    amount,
    industryGroup,
    sourceModule: "test",
    sourceRefId: "test",
    isTaxable,
  };
}

const calc = new TaxCalculator();
const threshold = new ThresholdChecker();
const builder = new DeclarationBuilder();
const helper = new DeadlineHelper();

// ═══════════════════════════════════════════════════════════════════════════
// A1 — TaxCalculator
// ═══════════════════════════════════════════════════════════════════════════
describe("A1 — TaxCalculator", () => {
  it("A1-001: distribution 1%+0.5% — DT 100tr", () => {
    const result = calc.calculate({
      period: mkPeriod(),
      taxpayer: mkProfile({ primaryIndustryGroup: "distribution" }),
      revenues: [mkRevenue(100_000_000, "distribution")],
    });
    expect(result.totalRevenue).toBe(100_000_000);
    expect(result.totalVat).toBe(1_000_000);
    expect(result.totalPit).toBe(500_000);
    expect(result.breakdowns[0].totalAmount).toBe(1_500_000);
  });

  it("A1-002: service_no_material 5%+2% — DT 50tr", () => {
    const result = calc.calculate({
      period: mkPeriod(),
      taxpayer: mkProfile({ primaryIndustryGroup: "service_no_material" }),
      revenues: [mkRevenue(50_000_000, "service_no_material")],
    });
    expect(result.totalVat).toBe(2_500_000);
    expect(result.totalPit).toBe(1_000_000);
  });

  it("A1-003: production_transport 3%+1.5% — DT 200tr", () => {
    const result = calc.calculate({
      period: mkPeriod(),
      taxpayer: mkProfile({ primaryIndustryGroup: "production_transport" }),
      revenues: [mkRevenue(200_000_000, "production_transport")],
    });
    expect(result.totalVat).toBe(6_000_000);
    expect(result.totalPit).toBe(3_000_000);
  });

  it("A1-004: other_business 2%+1% — DT 10tr", () => {
    const result = calc.calculate({
      period: mkPeriod(),
      taxpayer: mkProfile({ primaryIndustryGroup: "other_business" }),
      revenues: [mkRevenue(10_000_000, "other_business")],
    });
    expect(result.totalVat).toBe(200_000);
    expect(result.totalPit).toBe(100_000);
  });

  it("A1-005: asset_lease 0+5% — DT 20tr", () => {
    const result = calc.calculate({
      period: mkPeriod(),
      taxpayer: mkProfile({ primaryIndustryGroup: "asset_lease" }),
      revenues: [mkRevenue(20_000_000, "asset_lease")],
    });
    expect(result.totalVat).toBe(0);
    expect(result.totalPit).toBe(1_000_000);
  });

  it("A1-006: nhiều nhóm ngành trong 1 kỳ", () => {
    const result = calc.calculate({
      period: mkPeriod(),
      taxpayer: mkProfile(),
      revenues: [
        mkRevenue(100_000_000, "distribution"), // 1.5tr
        mkRevenue(50_000_000, "service_no_material"), // 3.5tr
        mkRevenue(10_000_000, "other_business"), // 300k
      ],
    });
    expect(result.totalRevenue).toBe(160_000_000);
    expect(result.breakdowns).toHaveLength(3);
    expect(result.totalVat + result.totalPit).toBe(
      1_500_000 + 3_500_000 + 300_000
    );
  });

  it("A1-007: doanh thu isTaxable=false bị bỏ qua", () => {
    const result = calc.calculate({
      period: mkPeriod(),
      taxpayer: mkProfile(),
      revenues: [
        mkRevenue(100_000_000, "distribution"),
        mkRevenue(50_000_000, "distribution", "2026-03-10T00:00:00Z", false),
      ],
    });
    expect(result.totalRevenue).toBe(100_000_000);
  });

  it("A1-008: giao dịch ngoài khoảng kỳ bị bỏ qua", () => {
    const result = calc.calculate({
      period: mkPeriod({ startDate: "2026-03-01", endDate: "2026-03-31" }),
      taxpayer: mkProfile(),
      revenues: [
        mkRevenue(100_000_000, "distribution", "2026-03-15T00:00:00Z"),
        mkRevenue(50_000_000, "distribution", "2026-04-01T00:00:00Z"),
        mkRevenue(30_000_000, "distribution", "2026-02-28T00:00:00Z"),
      ],
    });
    expect(result.totalRevenue).toBe(100_000_000);
  });

  it("A1-009: kỳ rỗng — total=0, breakdown fallback ngành taxpayer", () => {
    const result = calc.calculate({
      period: mkPeriod(),
      taxpayer: mkProfile({ primaryIndustryGroup: "distribution" }),
      revenues: [],
    });
    expect(result.totalRevenue).toBe(0);
    expect(result.totalTaxPayable).toBe(0);
    expect(result.breakdowns).toHaveLength(1);
    expect(result.breakdowns[0].industryGroup).toBe("distribution");
  });

  it("A1-010: môn bài kỳ year — áp dụng bậc", () => {
    const result = calc.calculate({
      period: mkPeriod({ kind: "year" }),
      taxpayer: mkProfile(),
      revenues: [mkRevenue(400_000_000, "service_no_material")],
    });
    expect(result.licenseFee).toBe(500_000);
  });

  it("A1-011: môn bài kỳ month — = 0", () => {
    const result = calc.calculate({
      period: mkPeriod({ kind: "month" }),
      taxpayer: mkProfile(),
      revenues: [mkRevenue(400_000_000, "service_no_material")],
    });
    expect(result.licenseFee).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// A2 — calcLicenseFee
// ═══════════════════════════════════════════════════════════════════════════
describe("A2 — calcLicenseFee", () => {
  it.each([
    ["A2-001: 80tr", 80_000_000, 0],
    ["A2-002: đúng 100tr (miễn)", 100_000_000, 0],
    ["A2-003: 150tr", 150_000_000, 300_000],
    ["A2-004: 300tr (biên)", 300_000_000, 300_000],
    ["A2-005: 400tr", 400_000_000, 500_000],
    ["A2-006: 500tr (biên)", 500_000_000, 500_000],
    ["A2-007: 600tr", 600_000_000, 1_000_000],
    ["A2-008: 5 tỷ", 5_000_000_000, 1_000_000],
  ])("%s", (_label, revenue, expected) => {
    expect(calc.calcLicenseFee(revenue)).toBe(expected);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// A3 — ThresholdChecker
// ═══════════════════════════════════════════════════════════════════════════
describe("A3 — ThresholdChecker", () => {
  it("A3-001: DT 85tr → near_exemption", () => {
    const warns = threshold.check(85_000_000, mkProfile());
    expect(warns.some((w) => w.code === "near_exemption")).toBe(true);
  });

  it("A3-002: DT 120tr → crossed_exemption", () => {
    const warns = threshold.check(120_000_000, mkProfile());
    expect(warns.some((w) => w.code === "crossed_exemption")).toBe(true);
  });

  it("A3-003: DT 1.2 tỷ distribution, no cash register → must_use_cash_register", () => {
    const warns = threshold.check(
      1_200_000_000,
      mkProfile({ primaryIndustryGroup: "distribution", usesCashRegister: false })
    );
    const w = warns.find((w) => w.code === "must_use_cash_register");
    expect(w).toBeDefined();
    expect(w!.severity).toBe("critical");
  });

  it("A3-004: DT 1.2 tỷ distribution + usesCashRegister=true → KHÔNG có cảnh báo", () => {
    const warns = threshold.check(
      1_200_000_000,
      mkProfile({ primaryIndustryGroup: "distribution", usesCashRegister: true })
    );
    expect(warns.some((w) => w.code === "must_use_cash_register")).toBe(false);
  });

  it("A3-005: DT 1.2 tỷ production_transport → KHÔNG trong nhóm bắt buộc", () => {
    const warns = threshold.check(
      1_200_000_000,
      mkProfile({ primaryIndustryGroup: "production_transport" })
    );
    expect(warns.some((w) => w.code === "must_use_cash_register")).toBe(false);
  });

  it("A3-006: DT 3.5 tỷ → must_switch_to_declaration", () => {
    const warns = threshold.check(3_500_000_000, mkProfile());
    expect(warns.some((w) => w.code === "must_switch_to_declaration")).toBe(
      true
    );
  });

  it("A3-007: DT 50tr → không có cảnh báo", () => {
    const warns = threshold.check(50_000_000, mkProfile());
    expect(warns).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// A4 — DeclarationBuilder
// ═══════════════════════════════════════════════════════════════════════════
describe("A4 — DeclarationBuilder", () => {
  const profile = mkProfile();
  const period = mkPeriod();
  const calculation = calc.calculate({
    period,
    taxpayer: profile,
    revenues: [mkRevenue(100_000_000, "service_no_material")],
  });

  it("A4-001: build tạo declaration draft với xmlPayload", () => {
    const decl = builder.build({ taxpayer: profile, period, calculation });
    expect(decl.formCode).toBe("01/CNKD");
    expect(decl.status).toBe("draft");
    expect(decl.xmlPayload).toBeTruthy();
    expect(decl.taxpayerId).toBe(profile.id);
  });

  it("A4-002: XML chứa MST, mã mẫu, kỳ khai, breakdowns", () => {
    const decl = builder.build({ taxpayer: profile, period, calculation });
    const xml = decl.xmlPayload!;
    expect(xml).toContain("01/CNKD");
    expect(xml).toContain(profile.taxCode);
    expect(xml).toContain("service_no_material");
    expect(xml).toContain("tuNgay>2026-03-01");
    expect(xml).toContain("denNgay>2026-03-31");
  });

  it("A4-003: escape XML cho ký tự đặc biệt", () => {
    const hostile = mkProfile({
      fullName: "Nguyễn <test> & \"Co.\"",
      address: "123 A&B Street",
    });
    const decl = builder.build({
      taxpayer: hostile,
      period,
      calculation,
    });
    const xml = decl.xmlPayload!;
    expect(xml).toContain("&lt;test&gt;");
    expect(xml).toContain("&amp;");
    expect(xml).toContain("&quot;");
    expect(xml).not.toContain("<test>");
  });

  it("A4-004: checkbox phương pháp map đúng", () => {
    const presumptive = builder.build({
      taxpayer: mkProfile({ method: "presumptive" }),
      period,
      calculation,
    });
    expect(presumptive.xmlPayload).toContain("HKDKhoan");

    const declaration = builder.build({
      taxpayer: mkProfile({ method: "declaration" }),
      period,
      calculation,
    });
    expect(declaration.xmlPayload).toContain("HKDKeKhai");

    const occ = builder.build({
      taxpayer: mkProfile({ method: "per_occurrence" }),
      period,
      calculation,
    });
    expect(occ.xmlPayload).toContain("CNKDTungLan");

    const onBehalf = builder.build({
      taxpayer: mkProfile({ method: "on_behalf" }),
      period,
      calculation,
    });
    expect(onBehalf.xmlPayload).toContain("KhaiThay");
  });

  it("A4-005: ID declaration chứa period.id", () => {
    const decl = builder.build({ taxpayer: profile, period, calculation });
    expect(decl.id).toContain(period.id);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// A5 — DeadlineHelper
// ═══════════════════════════════════════════════════════════════════════════
describe("A5 — DeadlineHelper", () => {
  it("A5-001: buildMonthPeriod(2026-03-15)", () => {
    const p = helper.buildMonthPeriod(new Date("2026-03-15T10:00:00"));
    expect(p.id).toBe("month-2026-03");
    expect(p.startDate).toBe("2026-03-01");
    expect(p.endDate).toBe("2026-03-31");
    expect(p.dueDate).toBe("2026-04-20");
  });

  it("A5-002: buildQuarterPeriod(2026-05-10) → Q2", () => {
    const p = helper.buildQuarterPeriod(new Date("2026-05-10T10:00:00"));
    expect(p.id).toBe("quarter-2026-Q2");
    expect(p.startDate).toBe("2026-04-01");
    expect(p.endDate).toBe("2026-06-30");
  });

  it("A5-003: buildYearPeriod(2026)", () => {
    const p = helper.buildYearPeriod(new Date("2026-06-01T00:00:00"));
    expect(p.startDate).toBe("2026-01-01");
    expect(p.endDate).toBe("2026-12-31");
    expect(p.dueDate).toBe("2027-03-31");
  });

  it("A5-004: daysUntilDue dương và âm", () => {
    const p = mkPeriod({ dueDate: "2026-04-20" });
    const daysBefore = helper.daysUntilDue(p, new Date("2026-04-10T00:00:00"));
    const daysAfter = helper.daysUntilDue(p, new Date("2026-04-25T00:00:00"));
    expect(daysBefore).toBeGreaterThan(0);
    expect(daysAfter).toBeLessThan(0);
  });

  it("A5-005: buildYearCalendar month → 12 kỳ", () => {
    const periods = helper.buildYearCalendar(
      mkProfile({ periodKind: "month" }),
      2026
    );
    expect(periods).toHaveLength(12);
  });

  it("A5-006: buildYearCalendar quarter → 4 kỳ", () => {
    const periods = helper.buildYearCalendar(
      mkProfile({ periodKind: "quarter" }),
      2026
    );
    expect(periods).toHaveLength(4);
  });

  it("A5-007: buildYearCalendar year → 1 kỳ", () => {
    const periods = helper.buildYearCalendar(
      mkProfile({ periodKind: "year" }),
      2026
    );
    expect(periods).toHaveLength(1);
  });

  it("A5-008: buildCurrentPeriod dispatch theo periodKind", () => {
    const m = helper.buildCurrentPeriod(
      mkProfile({ periodKind: "month" }),
      new Date("2026-03-15")
    );
    expect(m.kind).toBe("month");

    const q = helper.buildCurrentPeriod(
      mkProfile({ periodKind: "quarter" }),
      new Date("2026-03-15")
    );
    expect(q.kind).toBe("quarter");

    const y = helper.buildCurrentPeriod(
      mkProfile({ periodKind: "year" }),
      new Date("2026-03-15")
    );
    expect(y.kind).toBe("year");
  });
});
