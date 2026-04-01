export interface IInventoryResponse {
  id: number;
  name: string;
  address: string;
  position: number;
  branchId: number;
  branchName: string;
  bsnId: number;
  createdTime: string;
  employeeName: string;
  code: string;
  status: number;
  employeeId: number;
  isSelling: number | string;
  is_selling: number | string;
}

export interface IInventoryLedgerResponse {
  id: number;
  refType?: string;
  refTypeName?: string;
  refId?: number;
  refCode?: string;
  createdTime?: string;
  updatedTime?: string;
  productId?: number;
  productName?: string;
  productSku?: string;
  variantId?: number;
  variantSku?: string;
  partnerId?: number;
  partnerName?: string;
  partnerType?: string;
  warehouseId?: number;
  warehouseName?: string;
  fromWarehouseId?: number;
  fromWarehouseName?: string;
  toWarehouseId?: number;
  toWarehouseName?: string;
  quantity?: number;
  quantityChange?: number;
  baseQuantity?: number;
  unitId?: number;
  unitName?: string;
  unitCost?: number;
  prevQuantity?: number;
  afterQuantity?: number;
  employeeId?: number;
  employeeName?: string;
  refFinanceId?: number;
  refFinanceCode?: string;
  status?: number;
  statusName?: string;
  batchNo?: string;
  expiryDate?: string;
  reason?: string;
}
