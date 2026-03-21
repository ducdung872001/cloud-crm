export interface IProductFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IProductRequest {
  id?: number | null;
  name?: string;
  position?: number | string;
  status?: number | string;
  categoryId?: number | null;
  exchange?: number;
  otherUnits?: string;
  type?: string;
  description?: string;
  variantGroups?: {
    id?: number | null;
    name: string;
    key?: string;
    options: {
      id?: number | null;
      label: string;
    }[];
  }[];
  variants?: {
    id?: number | null;
    label: string;
    sku?: string;
    barcode?: string;
    unitId?: number | null;
    price: number;
    pricePromo?: number;
    supplierId?: number | null;
    costPrice?: number;
    quantity?: number;
    images?: string[];
    optionValueIds?: number[];
    attributes?: {
      name: string;
      value: string;
    }[];
  }[];
}
