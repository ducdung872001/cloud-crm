// Retail adapter — map từ nhánh reborn-retail sang shape chuẩn.
//
// Nguồn dữ liệu: đơn hàng POS (SaleOrder), hoá đơn điện tử, trả hàng.
// Retail = "Phân phối, cung cấp hàng hoá" theo TT40 → nhóm distribution (1% + 0.5% = 1.5%).
// Lưu ý NĐ 70/2025: doanh thu >1 tỷ/năm ngành retail buộc dùng máy tính tiền
// kết nối dữ liệu trực tiếp với cơ quan thuế.

import type { DataSourceAdapter } from "./types";
import type { RevenueRecord, ExpenseRecord, InventorySnapshot } from "../domain/types";
import { mockAdapter } from "./mockAdapter";

type RetailOrder = {
  id: string;
  code: string;
  createdAt: string;
  totalAmount: number;
  status: "pending" | "paid" | "cancelled" | "refunded";
  invoiceNo?: string;
};

type RetailExpense = {
  id: string;
  occurredAt: string;
  amount: number;
  category:
    | "labor"
    | "electricity"
    | "water"
    | "telecom"
    | "rent"
    | "admin"
    | "other";
  description?: string;
};

type RetailInventory = {
  openingMaterials: number;
  openingGoods: number;
  inflowMaterials: number;
  inflowGoods: number;
  outflowMaterials: number;
  outflowGoods: number;
  closingMaterials: number;
  closingGoods: number;
};

let _orderProvider: (() => Promise<RetailOrder[]>) | null = null;
let _expenseProvider: (() => Promise<RetailExpense[]>) | null = null;
let _inventoryProvider: (() => Promise<RetailInventory | null>) | null = null;

export function setRetailOrderProvider(
  provider: () => Promise<RetailOrder[]>
): void {
  _orderProvider = provider;
}

export function setRetailExpenseProvider(
  provider: () => Promise<RetailExpense[]>
): void {
  _expenseProvider = provider;
}

export function setRetailInventoryProvider(
  provider: () => Promise<RetailInventory | null>
): void {
  _inventoryProvider = provider;
}

function mapOrderToRevenue(o: RetailOrder): RevenueRecord {
  return {
    id: `retail-${o.id}`,
    occurredAt: o.createdAt,
    amount: o.totalAmount,
    industryGroup: "distribution", // Retail = phân phối hàng hoá (1.5%)
    description: `Đơn hàng ${o.code}`,
    sourceModule: "retail.order",
    sourceRefId: o.id,
    isTaxable: o.status === "paid",
    invoiceNo: o.invoiceNo,
  };
}

export const retailAdapter: DataSourceAdapter = {
  name: "retail",
  displayName: "Reborn Retail",

  async getRevenueRecords({ startDate, endDate }) {
    if (!_orderProvider) {
      return mockAdapter.getRevenueRecords({ startDate, endDate });
    }
    const orders = await _orderProvider();
    return orders
      .map(mapOrderToRevenue)
      .filter((r) => r.occurredAt >= startDate && r.occurredAt <= endDate);
  },

  async getExpenseRecords({ startDate, endDate }) {
    if (!_expenseProvider) {
      return mockAdapter.getExpenseRecords!({ startDate, endDate });
    }
    const expenses = await _expenseProvider();
    return expenses
      .filter(
        (e) => e.occurredAt >= startDate && e.occurredAt <= endDate
      )
      .map<ExpenseRecord>((e) => ({
        id: `retail-exp-${e.id}`,
        occurredAt: e.occurredAt,
        amount: e.amount,
        category: e.category,
        description: e.description,
        sourceModule: "retail.expense",
        sourceRefId: e.id,
        hasInvoice: true,
      }));
  },

  async getInventorySnapshot({ startDate, endDate }) {
    if (!_inventoryProvider) {
      return mockAdapter.getInventorySnapshot!({ startDate, endDate });
    }
    const inv = await _inventoryProvider();
    if (!inv) return null;
    return {
      periodId: `${startDate}-${endDate}`,
      ...inv,
    } as InventorySnapshot;
  },
};
