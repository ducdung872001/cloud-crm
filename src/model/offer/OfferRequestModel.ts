export interface IOfferFilterRequest {
    customerId?: number;  
    offerCode?: string;
    status?: number;
    keyword?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }
  
  export interface IOfferDetailFilterRequest {
    offerType?: string;
  }
  
  export interface IOfferDetailListFilterRequest {
    offerId?: number;
  }
  
  export interface IOfferRequest {
    amount: number;
    discount: number;
    vatAmount: number;
    fee: number;
    paid: number;
    debt: number;
    paymentType: string;
    receiptDate: string;
    offerCode: string;
    offerType: string;
  }
  
  export interface IOfferDetailRequest {
    id: number;
    batchNo: string;
    offerId: number;
    mainCost: string;
    mfgDate: string;
    productId: number;
    quantity: string;
    exchange: number;
    unitId: number;
    expiryDate: string;
    customerId: number;
  }
  
  export interface IOfferCreateRequest {
    id: number;
    paymentType?: string | number;
    offerType?: string;
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
    // tạo tạm ông này để xử lý form
    card?: any;
    cardName?: string;
    cardPrice?: number;
    moneyUsed?: number;
  }
  
  export interface ITemporarilyOfferRequest {
    id: number;
  }
  