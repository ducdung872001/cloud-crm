export interface IOfferServiceFilterRequest {
    customerId: number;
  }
  
  export interface IOfferServiceToInvoiceRequest {
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
    offerId: number;
  }
  
  export interface IOfferServiceRequest {
    customerId: number;
    discount: number;
    discountUnit: string;
    fee: number;
    offerId: number;
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
  