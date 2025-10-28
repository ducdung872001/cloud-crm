import { IInvoiceDetailResponse, IInvoiceCreateResponse, ICardInvoiceServiceResponse } from "./InvoiceResponse";

export interface AddProductImportModalProps {
  invoiceId: number;
  onShow: boolean;
  data?: IInvoiceDetailResponse;
  onHide: (reload: boolean) => void;
}

export interface PaymentImportInvoicesProps {
  data: IInvoiceCreateResponse;
  listInvoiceDetail?: IInvoiceDetailResponse[];
}

export interface SeeReceiptProps {
  idInvoice: number;
  onShow: boolean;
  onHide: () => void;
}

export interface ShowInvoiceModalProps {
  onShow: boolean;
  idInvoice: number;
}

export interface ShowPaymentBillModalProps {
  onShow: boolean;
  idInvoice: number;
  tab: string;
}

export interface ShowModalDetailSaleInvoiceProps {
  idInvoice: number;
  onShow: boolean;
  onHide: () => void;
}

export interface AddInfoCardServiceModalProps {
  customerId: number;
  invoiceId: number;
  onShow: boolean;
  data: ICardInvoiceServiceResponse;
  onHide: (reload: boolean) => void;
}

export interface UpUpdateCardServiceModalProps {
  onShow: boolean;
  data: ICardInvoiceServiceResponse;
  onHide: (reload: boolean) => void;
}

export interface IHistoryUseCardModalProps {
  id: number;
  onShow: boolean;
  infoCard: ICardInvoiceServiceResponse;
  onHide: () => void;
}
