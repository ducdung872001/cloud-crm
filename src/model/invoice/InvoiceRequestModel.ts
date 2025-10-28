export interface IInvoiceFilterRequest {
  customerId?: number;
  invoiceTypes?: string;
  invoiceCode?: string;
  status?: number;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  branchId?: number;
}

export interface IInvoiceDetailFilterRequest {
  invoiceType?: string;
}

export interface IInvoiceDetailListFilterRequest {
  invoiceId?: number;
}

export interface IInvoiceRequest {
  amount: number;
  discount: number;
  vatAmount: number;
  fee: number;
  paid: number;
  debt: number;
  paymentType: string;
  receiptDate: string;
  invoiceCode: string;
  invoiceType: string;
}

export interface IInvoiceDetailRequest {
  id: number;
  batchNo: string;
  invoiceId: number;
  mainCost: string;
  mfgDate: string;
  productId: number;
  quantity: string;
  exchange: number;
  unitId: number;
  expiryDate: string;
  customerId: number;
}

export interface IInvoiceCreateRequest {
  id: number;
  paymentType?: string | number;
  invoiceType?: string;
  amount?: number;
  debt?: number;
  discount?: number;
  fee?: number;
  paid?: number;
  receiptDate?: any;
  vatAmount?: number;
  account?: string;
  amountCard?: number;
  branchId?: number;
  inventoryId?: number;
  customerId?: number;
  campaignId?: number;
  saleflowId?: number;
  // tạo tạm ông này để xử lý form
  card?: any;
  cardName?: string;
  cardPrice?: number;
  moneyUsed?: number;
}

export interface ITemporarilyInvoiceRequest {
  id: number;
}
