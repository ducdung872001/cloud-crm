export interface IOfferCardFilterRequest {
    customerId: number;
    checkAccount?: number;
  }
  
  export interface IOfferCardRequest {
    id: number;
    invoiceId: number;
    account: number;
    cardId: number;
    cardNumber: string;
    cash: number;
    customerId: number;
    fee: number;
    fmtOrderDate: string;
    note: string;
    qty: number;
    saleId: number;
    status: number;
    treatmentNum?: number;
    serviceId?: number;
    serviceCombo: string;
    // trường này thêm vào với mục đích hiển thị lên form
    accountCard?: number;
    totalCard?: number;
  }
  
  export interface IOfferCardUpdateRequest {
    id: number;
    cardNumber: string;
  }
  