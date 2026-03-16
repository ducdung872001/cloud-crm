export interface IMaterialResponse {
  id: number;
  name: string;
  avatar?: string;
  code?: string;
  productLine?: string;
  position?: number;
  status: number;
  unitId?: number;
  unitName?: string;
  price?: number;
  type?: number;
  otherUnits: string;
  bsnId?: number;
  hashedLink?: string;
  pageTitle?: string;
  pageDescription?: string;
  pageKeyword?: string;
  expiredPeriod?: number;
  minQuantity?: number;
  maxQuantity?: number;
  documents?: any;
  // Extended fields
  categoryName?: string;
  supplier?: string;
  stockCurrent?: number;
  stockStatus?: "ok" | "low" | "out";
  note?: string;
}
