// Adapter interface — mỗi nhánh sản phẩm (fitpro, retail, community-hub, spa…)
// implement interface này để bơm dữ liệu vào tax module.
//
// Tax module CHỈ gọi qua interface này, KHÔNG biết gì về cấu trúc nội bộ của nhánh.
// Muốn port sang nhánh khác: viết 1 file adapter mới, đăng ký qua registerDataSourceAdapter.

import type { RevenueRecord, ExpenseRecord, InventorySnapshot } from "../domain/types";

export interface DataSourceAdapter {
  /** Tên nhận diện adapter, ví dụ "fitpro" | "retail" | "community" | "spa" */
  readonly name: string;
  /** Label hiển thị lên UI */
  readonly displayName: string;

  /** Lấy danh sách doanh thu trong khoảng thời gian */
  getRevenueRecords(params: {
    startDate: string; // ISO yyyy-mm-dd
    endDate: string;
  }): Promise<RevenueRecord[]>;

  /** Lấy danh sách chi phí (dùng cho phương pháp kê khai) — optional */
  getExpenseRecords?(params: {
    startDate: string;
    endDate: string;
  }): Promise<ExpenseRecord[]>;

  /** Lấy snapshot tồn kho đầu/cuối kỳ — optional, chỉ cần nếu dùng 01-2/BK-HDKD */
  getInventorySnapshot?(params: {
    startDate: string;
    endDate: string;
  }): Promise<InventorySnapshot | null>;
}

// ═══ Registry ═════════════════════════════════════════════════════════════
const _registry: Map<string, DataSourceAdapter> = new Map();

export function registerDataSourceAdapter(adapter: DataSourceAdapter): void {
  _registry.set(adapter.name, adapter);
}

export function getDataSourceAdapter(name: string): DataSourceAdapter | undefined {
  return _registry.get(name);
}

export function listDataSourceAdapters(): DataSourceAdapter[] {
  return Array.from(_registry.values());
}

/** Adapter mặc định — nhánh hiện tại nên setDefaultAdapter() lúc init */
let _defaultAdapterName: string | null = null;

export function setDefaultAdapter(name: string): void {
  _defaultAdapterName = name;
}

export function getDefaultAdapter(): DataSourceAdapter | undefined {
  if (!_defaultAdapterName) {
    // Fallback: lấy adapter đầu tiên nếu chỉ có 1
    return _registry.size === 1 ? Array.from(_registry.values())[0] : undefined;
  }
  return _registry.get(_defaultAdapterName);
}
