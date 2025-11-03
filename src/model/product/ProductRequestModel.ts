export interface IProductFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IProductRequest {
  id: number;
  name: string;
  avatar: string;
  code: string;
  productLine: string;
  position: number | string;
  bsnId: number;
  unitId: number;
  unitName: string;
  price: number | string;
  exchange: number;
  status: number | string;
  otherUnits?: string;
  type?: string;
  expiredPeriod?: number;
  minQuantity?: number;
  productExtraInfos?: any;
  categoryId?: number;
  categoryName?: string;
  documents?: any;
}
