import { IOfferServiceResponse } from "./OfferServiceResponseModel";

export interface AddOfferServiceProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  idCustomer: number;
  offerId: number;
  data: IOfferServiceResponse;
}
