export interface IMaterialFilterRequest {
  keyword?: string;
  categoryId?: number;
  status?: number;
  page?: number;
  limit?: number;
}

export interface IMaterialRequest {
  id?: number;
  code?: string;
  name: string;
  categoryId?: number;
  unitId?: number;
  unitName?: string;
  supplierId?: number;
  supplierName?: string;
  price?: number | string;
  minQuantity?: number | string;
  maxQuantity?: number | string;
  note?: string;
  avatar?: string;
  status?: number;
  // legacy kept for compat
  productLine?: string;
  position?: number | string;
  bsnId?: number;
  exchange?: number;
  otherUnits?: string;
  type?: string;
  expiredPeriod?: number;
  supplier?: string;
  productExtraInfos?: any;
  documents?: any;
}