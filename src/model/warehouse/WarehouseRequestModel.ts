export interface IWarehouseFilterRequest {
  keyword?: string;
  name?: string;
  branchId?: number;
  page?: number;
  limit?: number;
}

export interface IListWarehouseProductFilterRequest {
  keyword?: string;
  inventoryId?: number;
  page?: number;
  limit?: number;
}

export interface IInfoExpiryDateProductionDate {
  productId: number;
  batchNo: string;
}
