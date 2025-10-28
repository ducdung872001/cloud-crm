import { IPartnerEmailResponseModel } from "./PartnerEmailResponseModel";

export interface IAddPartnerEmailModelProps {
  onShow: boolean;
  data: IPartnerEmailResponseModel;
  onHide: (reload: boolean) => void;
}

export interface IPartnerEmailListProps {
  onBackProps: (isBack: boolean) => void;
}
