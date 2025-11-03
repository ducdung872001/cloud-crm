export interface IAdjustmentSlipResponse {
  id: number;
  code: string;
  createdTime: string;
  created_at: string;
  creatorId: string;
  creatorName: string;
  status: number;
  inventoryId: number;
  inventoryName: string;
  bsnId: number;
}

export interface IWarehouseProResponse {
  id: number;
  inventoryId: number;
  inventoryName: string;
  productId: number;
  productName: string;
  productAvatar: string;
  price: number;
  batchNo: string;
  discount: number;
  discountUnit: string;
  expiryDate: string;
  quantity: number;
  unitId: number;
  unitName: string;
}

interface IStockAdjustDetails {
  id: number;
  offsetQty: number;
  productId: number;
  availQty: number;
  satId: number;
  unitId: number;
  batchNo: string;
  productAvatar: string;
  productName: string;
  reason: string;
  unitName: string;
}

export interface IDetailAdjustmentSlipResponse {
  satId: number;
  stockAdjust: IAdjustmentSlipResponse;
  stockAdjustDetails: IStockAdjustDetails[];
}
