export interface IAdjustmentSlipFilterRequest {
  name: string;
  page?: number;
  limit?: number;
  fromTime?: string;
  toTime?: string;
  status?: number;
  inventoryId?: number;
}

export interface IWarehouseProFilterRequest {
  keyword: string;
  inventoryId?: number;
  page?: number;
  limit?: number;
}

export interface IAdjustmentSlipRequest {
  id: number;
  inventoryId: number;
}

export interface IAddUpdateProRequest {
  id: number;
  productId: number;
  productName: string;
  productAvatar: string;
  batchNo: string;
  unitId: number;
  unitName: string;
  reason: string;
  availQty: number;
  offsetQty: number;
  satId: number;
  inventoryId: number;
  inventoryName: string;
}

export interface IViewAdjustmentSlipProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  idAdjustment: number;
  type: string;
  name: string;
}
