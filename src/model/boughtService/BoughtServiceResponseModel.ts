export interface IBoughtServiceByCustomerResponse {
  id: number;
  serviceId: number;
  serviceName: string;
  receiptDate: string;
  qty: number;
  priceDiscount: number;
  price: number;
  discount: number;
  fee: number;
  note: string;
  priceVariationId: string;
  saleEmployeeId: number;
  updatedTime: string;
  customerId: number;
  action: number;
  invoiceId: number;
  invoiceCode: number;
  treatmentNum: number;
  totalTreatment: number;
  cardNumber: number;
  serviceNumber: string;
  customerName: string;
  customerPhone: string;
}

export interface IBoughtServiceResponse {
  id: number;
  action: number;
  customerId: number;
  discount: number;
  discountUnit: number;
  fee: number;
  invoiceCode: string;
  invoiceId: number;
  receiptDate?: number;
  note: string;
  price: number;
  priceDiscount: number;
  priceVariationId: string;
  qty: number;
  saleEmployeeId: number;
  serviceId: number;
  serviceNumber: string;
  updatedTime: string;
  serviceName: string;
  serviceAvatar: string;  
}
