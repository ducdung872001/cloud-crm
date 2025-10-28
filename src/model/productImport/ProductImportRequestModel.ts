export interface IProductImportFilterRequest {
  invoiceId: number;
}

export interface IProductImportRequest {
  id?: number;
  customerId?: number;
  productId: number;
  batchNo: string;
  unitId: number;
  mainCost: number;
  quantity: number;
  mfgDate: string;
  expiryDate: string;
  invoiceId: number;
}
