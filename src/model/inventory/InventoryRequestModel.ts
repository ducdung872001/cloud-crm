export interface IInventoryFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IInventoryLedgerFilterRequest {
  refType?: string;
  warehouseId?: number;
  productId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface IInventoryRequest {
  id: number;
  name: string;
  address: string;
  position: string;
  branchId: number;
  bsnId: number;
  code: string;
  status: number;
  employeeId: number;
}
