export interface IOfferProductFilterRequest {
    customerId?: number;
    keyword?: string;
    fromTime?: string;
    toTime?: string;
    page?: number;
    limit?: number;
  }
  export interface IOfferProductToInvoiceRequest {
    productId: number;
    batchNo?: string;
    unitId: number;
    price: number;
    priceDiscount: number;
    discount: number;
    discountUnit: number;
    qty: number;
    saleId: number;
    fee: number;
    note?: string;
    customerId: number;
    offerId: number;
  }
  
  export interface IOfferProductRequest {
    id: number;
    offerId: number;
    note: string;
    price: number;
    priceDiscount: number;
    inventoryId: number;
    productId: number;
    unitId: number;
    qty: number;
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
  