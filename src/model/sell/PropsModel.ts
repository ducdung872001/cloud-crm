import { IInvoiceCreateRequest } from "model/invoice/InvoiceRequestModel";
import { ICardInvoiceServiceResponse } from "model/invoice/InvoiceResponse";
export interface IShowCustomerInvoiceProps {
  idCustomerPay: number;
  onShow: boolean;
  onHide: (hide: boolean) => void;
}

export interface ICardServiceListProps {
  tab: string;
  idCustomer: number;
  showModalAdd: boolean;
  setShowModalAdd: any;
  dataService: ICardInvoiceServiceResponse;
  setDataService: any;
  dataPaymentBill: IInvoiceCreateRequest;
  setDataPaymentBill: any;
  setListIdCardService: any;
}

export interface IPaymentBillProps {
  idCustomer: number;
  dataPaymentBill: IInvoiceCreateRequest;
  tab: string;
  listIdCardService: number[];
  listIdProduct: number[];
  listIdService: number[];
  productIdGetCode: number;
  invoiceCode: any;
  setInvoiceCode: any;
}
