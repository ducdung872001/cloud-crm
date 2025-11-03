import { ICardResponse } from "./CardResponseModel";

export interface AddCardModalProps {
  onShow: boolean;
  data?: ICardResponse;
  onHide: (reload: boolean) => void;
}

export interface ICustomerCardListProps {
  onBackProps: (isBack: boolean) => void;
}
