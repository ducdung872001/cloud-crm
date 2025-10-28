import { ICardServiceResponse } from "./CardServiceResponseModel";

export interface AddCardServiceModalProps {
  onShow: boolean;
  data?: ICardServiceResponse;
  onHide: (reload: boolean) => void;
}

export interface IServiceCardListProps {
  onBackProps: (isBack: boolean) => void;
}
