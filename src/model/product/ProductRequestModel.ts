export interface IProductFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
  warehouseId?: number;
  status?: number;
  categoryId?: number;
  tagId?: number;
  isLowStock?: number;
  isWebsiteVisible?: number;
  isOutOfStock?: number;
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
  trackStock?: boolean;
  stock?: number;
  minStock?: number;
  maxStock?: number;
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
    priceWholesale?: number;
    pricePromotion?: number;
    supplierId?: number | null;
    costPrice?: number;
    quantity?: number;
    images?: string[];
    variantPrices?: {
      id?: number | null;
      unitId?: number | null;
      unitName?: string;
      price?: number;
    }[];
    selectedOptions?: {
      groupName?: string;
      label?: string;
      optionValueId?: number;
    }[];
    optionValueIds?: number[];
    attributes?: {
      name: string;
      value: string;
    }[];
  }[];
}