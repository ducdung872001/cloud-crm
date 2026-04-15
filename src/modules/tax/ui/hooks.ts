// Shared hooks dùng chung giữa các trang tax.

import { useEffect, useState } from "react";
import { taxStorage } from "../services/taxStorage";
import { taxEngine } from "../domain/engine";
import { getDefaultAdapter } from "../adapters/types";
import type {
  TaxpayerProfile,
  TaxPeriod,
  RevenueRecord,
  ExpenseRecord,
  TaxCalculationResult,
  ThresholdWarning,
} from "../domain/types";

/** Lấy taxpayer từ localStorage, fallback sang profile mẫu nếu chưa có */
export function useTaxpayerProfile(): [
  TaxpayerProfile,
  (updater: TaxpayerProfile) => void
] {
  const [profile, setProfile] = useState<TaxpayerProfile>(() => {
    const stored = taxStorage.getProfile();
    if (stored) return stored;
    return defaultProfile();
  });

  const save = (next: TaxpayerProfile) => {
    const saved = taxStorage.saveProfile(next);
    setProfile(saved);
  };

  return [profile, save];
}

export function defaultProfile(): TaxpayerProfile {
  return {
    id: "tp-demo",
    taxCode: "",
    fullName: "",
    nationalId: "",
    businessName: "",
    address: "",
    province: "Hà Nội",
    method: "presumptive",
    periodKind: "year",
    primaryIndustryGroup: "service_no_material",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/** Aggregate doanh thu + chi phí cho 1 kỳ bằng adapter mặc định */
export function usePeriodData(period: TaxPeriod | null) {
  const [revenues, setRevenues] = useState<RevenueRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [adapterName, setAdapterName] = useState<string>("");

  useEffect(() => {
    if (!period) return;
    const adapter = getDefaultAdapter();
    if (!adapter) return;
    setAdapterName(adapter.displayName);
    setLoading(true);
    Promise.all([
      adapter.getRevenueRecords({
        startDate: period.startDate,
        endDate: period.endDate,
      }),
      adapter.getExpenseRecords
        ? adapter.getExpenseRecords({
            startDate: period.startDate,
            endDate: period.endDate,
          })
        : Promise.resolve([]),
    ])
      .then(([rev, exp]) => {
        setRevenues(rev);
        setExpenses(exp);
      })
      .finally(() => setLoading(false));
  }, [period?.id]);

  return { revenues, expenses, loading, adapterName };
}

/** Tính thuế + cảnh báo ngưỡng cho profile + period hiện tại */
export function useTaxCalculation(
  taxpayer: TaxpayerProfile,
  period: TaxPeriod | null,
  revenues: RevenueRecord[],
  expenses: ExpenseRecord[]
): {
  calculation: TaxCalculationResult | null;
  warnings: ThresholdWarning[];
} {
  if (!period) return { calculation: null, warnings: [] };
  const calculation = taxEngine.calculator.calculate({
    period,
    taxpayer,
    revenues,
    expenses,
  });
  // Ước tính doanh thu năm để chạy threshold checker
  const days =
    (new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) /
      (1000 * 60 * 60 * 24) +
    1;
  const annualEstimate = (calculation.totalRevenue / Math.max(1, days)) * 365;
  const warnings = taxEngine.thresholdChecker.check(annualEstimate, taxpayer);
  return { calculation, warnings };
}
