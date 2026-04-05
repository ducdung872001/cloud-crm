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
  setShowModalAdd: (show: boolean) => void;
  dataService: ICardInvoiceServiceResponse;
  setDataService: (data: ICardInvoiceServiceResponse) => void;
  dataPaymentBill: IInvoiceCreateRequest;
  setDataPaymentBill: (data: IInvoiceCreateRequest) => void;
  setListIdCardService: (ids: number[]) => void;
}

export interface IPaymentBillProps {
  idCustomer: number;
  dataPaymentBill: IInvoiceCreateRequest;
  tab: string;
  listIdCardService: number[];
  listIdProduct: number[];
  listIdService: number[];
  productIdGetCode: number;
  invoiceCode: string;
  setInvoiceCode: (code: string) => void;
}
