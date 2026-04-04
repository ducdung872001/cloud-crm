export interface IBoughtProductFilterRequest {
  customerId?: number;
  keyword?: string;
  fromTime?: string;
  toTime?: string;
  page?: number;
  limit?: number;
}
export interface IBoughtProductToInvoiceRequest {
  productId: number;
  batchNo?: string;
  unitId: number;
  price: number;
  priceDiscount: number;
  discount: number;
  discountUnit: number;
  quantity: number;
  saleId: number;
  fee: number;
  note?: string;
  customerId: number;
  invoiceId: number;
}

export interface IBoughtProductRequest {
  id: number;
  invoiceId: number;
  note: string;
  price: number;
  priceDiscount: number;
  inventoryId: number;
  productId: number;
  unitId: number;
  quantity: number;
  saleId: number;
  discountUnit: string;
  discount: number;
  customerId: number;
  fee: number;
  batchNo: string | number;
  fmtOrderDate: string;
  // đoạn này tự cho thêm để xử lý form
  priceSample?: number;
  productInventory?: number;
}

export interface IInsertedItem {
  productId: number;
  variantId: number;
  batchNo?: string; // already optional
  unitId?: number; // was number | null
  price: number;
  priceDiscount?: number; // was number | null
  quantity?: number; // was number | null
  mfgDate?: string; // was string | null
  expiryDate?: string; // was string | null
  discount?: number; // was number | null
  discountUnit?: number; // was number | null
  fee?: number; // was number | null
  vat?: number; // was number | null
  saleId?: number; // was number | null
  note?: string; // was string | null
  customerId: number | string;
  inventoryId?: number; // was number | null
  invoiceId?: number;
  invoiceCode?: string; // was string | null
  customerName?: string; // was string | null
  customerPhone?: string; // was string | null
  name?: string; // was string | null
  avatar?: string; // was string | null
  receiptDate?: string; // was string | null
  unitName?: string; // was string | null
}
