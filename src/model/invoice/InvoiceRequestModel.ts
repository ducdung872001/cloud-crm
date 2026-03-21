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
  /** ✅ Bắt buộc — biến thể sản phẩm. Backend tự fill productId từ variantId */
  variantId: number;
  /** Optional — giữ để tương thích ngược, backend sẽ tự điền nếu không gửi */
  productId?: number;
  mainCost: string;
  /** Chiết khấu % theo lô (0–100). Mới thêm */
  discount?: number;
  mfgDate: string;
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
  card?: any;
  cardName?: string;
  cardPrice?: number;
  moneyUsed?: number;
}

export interface IShipmentCreatePayload {
  internalOrderId: string;
  carrierCode: string;
  sender: {
    name: string;
    phone: string;
    email: string;
    address: string;
    ward: string;
    district: string;
    province: string;
  };
  receiver: {
    name: string;
    phone: string;
    email: string;
    address: string;
    ward: string;
    district: string;
    province: string;
  };
  parcel: {
    weightGram: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  codAmount: number;
  declaredValue: number;
  shippingFeeBearer: "RECEIVER" | "SENDER";
  items: { name: string; quantity: number; weightGram: number; price: number }[];
  note: string;
}

export interface ITemporarilyInvoiceRequest {
  id: number;
}