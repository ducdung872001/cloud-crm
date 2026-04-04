export interface IOfferProductToInvoiceResponse {
    id: number;
    offerCode: string;
    customerName: string;
    customerPhone: string;
    orderDate: string;
    receiptDate: string;
    name: string;
    quantity: number;
    fee: number;
  }

  export interface IOfferProductResponse {
    batchNo: string;
    avatar: string;
    customerId: number;
    customerName: string;
    customerPhone: string;
    discount: number;
    discountUnit: number;
    expiryDate;
    fee: number;
    id: number;
    offerCode: number;
    offerId: number;
    note: string;
    price: number;
    priceDiscount: number;
    inventoryId: number;
    productId: number;
    name: string;
    quantity: number;
    saleId: number;
    unitId: number;
    unitName: string;
    vat: number;
    receiptDate: string;
    // đoạn này tự cho thêm để xử lý form
    priceSample?: number;
    productInventory?: number;
  }
  