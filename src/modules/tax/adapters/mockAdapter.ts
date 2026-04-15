// Mock adapter — sinh dữ liệu demo để preview khi chưa có BE.
// Dùng được cho mọi nhánh, làm fallback khi adapter thật chưa kịp register.

import type { DataSourceAdapter } from "./types";
import type { RevenueRecord, ExpenseRecord } from "../domain/types";

const INDUSTRY_MIX = [
  { group: "distribution" as const, weight: 0.5, label: "Bán lẻ" },
  { group: "service_no_material" as const, weight: 0.4, label: "Dịch vụ" },
  { group: "other_business" as const, weight: 0.1, label: "Khác" },
];

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateRevenues(startDate: string, endDate: string): RevenueRecord[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
  const rand = seededRand(start.getTime());
  const records: RevenueRecord[] = [];

  for (let d = 0; d < days; d++) {
    const dailyTxCount = Math.floor(rand() * 8) + 2; // 2–9 giao dịch/ngày
    for (let t = 0; t < dailyTxCount; t++) {
      const pickRand = rand();
      let acc = 0;
      let picked = INDUSTRY_MIX[0];
      for (const m of INDUSTRY_MIX) {
        acc += m.weight;
        if (pickRand <= acc) {
          picked = m;
          break;
        }
      }
      const amount = Math.round((rand() * 900_000 + 100_000) / 1000) * 1000;
      const occur = new Date(start);
      occur.setDate(occur.getDate() + d);
      occur.setHours(8 + Math.floor(rand() * 12));
      records.push({
        id: `mock-rev-${d}-${t}`,
        occurredAt: occur.toISOString(),
        amount,
        industryGroup: picked.group,
        description: `${picked.label} — giao dịch mẫu #${t + 1}`,
        sourceModule: "mock",
        sourceRefId: `mock-${d}-${t}`,
        isTaxable: true,
      });
    }
  }
  return records;
}

function generateExpenses(startDate: string, endDate: string): ExpenseRecord[] {
  const rand = seededRand(new Date(startDate).getTime() + 999);
  const categories = [
    { cat: "labor" as const, base: 15_000_000, desc: "Chi phí nhân công" },
    { cat: "rent" as const, base: 8_000_000, desc: "Tiền thuê mặt bằng" },
    { cat: "electricity" as const, base: 2_500_000, desc: "Điện" },
    { cat: "water" as const, base: 400_000, desc: "Nước" },
    { cat: "telecom" as const, base: 600_000, desc: "Internet/Viễn thông" },
    { cat: "admin" as const, base: 1_200_000, desc: "Quản lý, VPP" },
    { cat: "other" as const, base: 2_000_000, desc: "Chi phí khác" },
  ];
  return categories.map((c, i) => ({
    id: `mock-exp-${i}`,
    occurredAt: startDate,
    amount: Math.round((c.base * (0.8 + rand() * 0.4)) / 1000) * 1000,
    category: c.cat,
    description: c.desc,
    sourceModule: "mock",
    sourceRefId: `mock-exp-${i}`,
    hasInvoice: i < 5,
  }));
}

export const mockAdapter: DataSourceAdapter = {
  name: "mock",
  displayName: "Dữ liệu mẫu (demo)",

  async getRevenueRecords({ startDate, endDate }) {
    return generateRevenues(startDate, endDate);
  },

  async getExpenseRecords({ startDate, endDate }) {
    return generateExpenses(startDate, endDate);
  },

  async getInventorySnapshot() {
    return {
      periodId: "mock",
      openingMaterials: 15_000_000,
      openingGoods: 35_000_000,
      inflowMaterials: 25_000_000,
      inflowGoods: 60_000_000,
      outflowMaterials: 22_000_000,
      outflowGoods: 58_000_000,
      closingMaterials: 18_000_000,
      closingGoods: 37_000_000,
    };
  },
};
