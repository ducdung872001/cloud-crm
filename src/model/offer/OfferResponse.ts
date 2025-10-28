export interface IOfferResponse {
    id: number;
    offerCode: string;  
    amount: number;
    amountCard?: number;
    discount: number;
    fee: number;
    paid: number;
    status: number;
    debt: number;
    vatAmount: number | null;
    receiptDate: string;
    customerAddress: string;
    customerAvatar: string;
    customerEmail: string;
    customerId?: number;
    customerName: string;
    customerPhone: string;
    employeeId: number;
    employeeName: string;
    employeePhone: string;
  }
  
  export interface IOfferDetailResponse {
    id: number;
    offerId: number;
    bsnId: number;
    productId: number;
    productName: string;
    unitId: number;
    unitName: string;
    quantity: number;
    mainCost: number;
    exchange: string | null;
    preCost: string | null;
    batchNo: string;
    createdTime: string;
    updatedTime: string;
    expiryDate: string;
    mfgDate: string;
  }
  
  export interface IOfferCreateResponse {
    id: number;
    offerCode?: string;
    offerType?: string;
    createdTime?: string;
    receiptDate?: string;
    updatedTime?: string;
    account?: null;
    amountCard?: null;
    branchId?: null;
    receiptImage?: null;
    referId?: null;
    amount?: number;
    bsnId?: number;
    customerId?: number;
    debt?: number;
    discount?: number;
    employeeId?: number;
    fee?: number;
    paid?: number;
    paymentType?: number;
    status?: number;
    vatAmount?: number;
    inventoryId?: number;
  }
  
  export interface ICardOfferServiceResponse {
    id: number;
    offerId: number;
    offerCode?: string;
    cardId: number;
    account: number;
    cash: number;
    fee: number;
    qty: number;
    customerId: number;
    name: string;
    note: number;
    receiptDate: number;
    saleId: number;
    status: number;
    avatar: string;
    cardNumber: string;
    remaining?: number;
    treatmentNum?: number;
    totalTreatment?: number;
    serviceCombo?: string;
    serviceId?: number;
    serviceName: string;
  }
  
  export interface IProductOfferServiceResponse {
    offerId: number;
    bptId: number;
    bseId: number;
    discount: number;
    discountUnit: number;
    fee: number;
    name: string;
    orderDate: string;
    price: number;
    priceDiscount: number;
    productId: number;
    qty: number;
    serviceId: number;
    serviceName: string;
    serviceAvatar: string;
    vat: number;
    productAvatar: string;
    batchNo: string;
    unitName: string;
  }
  