export interface IMaterialResponse {
  id: number;
  code?: string;
  name: string;
  avatar?: string;
  categoryId?: number;
  categoryName?: string;
  unitId?: number;
  unitName?: string;
  supplierId?: number;
  supplierName?: string;
  supplier?: string; // alias for compatibility
  price?: number;
  minQuantity?: number;
  maxQuantity?: number;
  stockCurrent?: number;
  stockStatus?: "ok" | "low" | "out";
  note?: string;
  status: number;
  bomCount?: number;
  // legacy / unused fields (kept for backward compat)
  otherUnits?: string;
  bsnId?: number;
}

export interface IMaterialSummaryResponse {
  total: number;
  inStock: number;
  low: number;
  out: number;
  categoryCount: number;
}