import { IInvoiceResponse } from "model/invoice/InvoiceResponse";
import { IOfferResponse } from "model/offer/OfferResponse";

export interface IRecoverPublicDebtsProps {
  onShow: boolean;
  idCustomer: number;
  dataInvoice?: IInvoiceResponse;
  dataOffer?: IOfferResponse;
  onHide: (reload: boolean) => void;
}
