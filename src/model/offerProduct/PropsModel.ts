import { IOfferProductResponse } from "./OfferProductResponseModel";

export interface AddOfferProductModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  idCustomer: number;
  offerId: number;
  data: IOfferProductResponse;
}
