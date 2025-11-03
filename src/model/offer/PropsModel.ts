import { IOfferDetailResponse, IOfferCreateResponse, ICardOfferServiceResponse } from "./OfferResponse";

export interface AddProductImportModalProps {
  offerId: number;
  onShow: boolean;
  data?: IOfferDetailResponse;
  onHide: (reload: boolean) => void;
}

export interface PaymentImportOffersProps {
  data: IOfferCreateResponse;
  listOfferDetail?: IOfferDetailResponse[];
}

export interface SeeReceiptProps {
  idOffer: number;
  onShow: boolean;
  onHide: () => void;
}

export interface ShowOfferModalProps {
  onShow: boolean;
  idOffer: number;
}

export interface ShowPaymentBillModalProps {
  onShow: boolean;
  idOffer: number;
  tab: string;
}

export interface ShowModalDetailOfferProps {
  idOffer: number;
  onShow: boolean;
  onHide: () => void;
}

export interface AddInfoCardServiceModalProps {
  customerId: number;
  offerId: number;
  onShow: boolean;
  data: ICardOfferServiceResponse;
  onHide: (reload: boolean) => void;
}

export interface UpUpdateCardServiceModalProps {
  onShow: boolean;
  data: ICardOfferServiceResponse;
  onHide: (reload: boolean) => void;
}

export interface IHistoryUseCardModalProps {
  id: number;
  onShow: boolean;
  infoCard: ICardOfferServiceResponse;
  onHide: () => void;
}
