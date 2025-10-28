export interface IBoughtServiceFilterRequest {
  customerId: number;
}

export interface IBoughtServiceToInvoiceRequest {
  customerId: number;
  serviceId: number;
  qty: number;
  note?: string;
  price: number;
  retail: number;
  retailPrice: number;
  packageType: number;
  priceDiscount: number;
  discount: number;
  discountUnit: number;
  fee: number;
  saleEmployeeId?: number;
  invoiceId: number;
}

export interface IBoughtServiceRequest {
  customerId: number;
  discount: number;
  discountUnit: string;
  fee: number;
  invoiceId: number;
  note: string;
  price: number;
  priceDiscount: number;
  priceVariationId: string;
  qty: number;
  saleEmployeeId: number;
  serviceId: number;
  serviceNumber: string;
  // thêm đoạn này vào để view lên form hiển thị
  treatmentNum: number;
  priceSample: number;
  totalPayment: number;
}
