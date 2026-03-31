export interface IProductionOrderMaterial {
  id?: number;
  materialId: number;
  materialCode?: string;
  materialName: string;
  unitName?: string;
  plannedQty: number;
  consumedQty?: number;
  stockBefore?: number;
  stockAfter?: number;
}

export interface IProductionOrderListItem {
  id: number;
  code: string;
  bomId: number;
  bomCode?: string;
  productName: string;
  productSku?: string;
  plannedQty: number;
  totalOutputQty: number;
  outputUnit?: string;
  status: number;          // 1=Nháp 2=Đang SX 3=Hoàn thành 4=Hủy
  statusName?: string;
  plannedDate?: string;
  createdTime?: string;
}

export interface IProductionOrderDetail extends IProductionOrderListItem {
  productId?: number;
  productVariantId?: number;
  outputQtyPerBatch?: number;
  materialWarehouseId?: number;
  productWarehouseId?: number;
  actualOutputQty?: number;
  note?: string;
  updatedTime?: string;
  materials?: IProductionOrderMaterial[];
}

export interface IProductionOrderSummary {
  total: number;
  draft: number;
  inProcess: number;
  done: number;
  cancelled: number;
}

export interface IProductionOrderCreateRequest {
  bomId: number;
  bomCode?: string;
  productId?: number;
  productVariantId?: number;
  productName: string;
  productSku?: string;
  plannedQty: number;
  outputQtyPerBatch: number;
  outputUnit?: string;
  materialWarehouseId?: number;
  productWarehouseId?: number;
  plannedDate?: string;
  note?: string;
  materials: {
    materialId: number;
    materialCode?: string;
    materialName: string;
    unitName?: string;
    plannedQty: number;
  }[];
}
