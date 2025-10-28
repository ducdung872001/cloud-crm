import { IPartnerSMSResponseModel } from "./PartnerSMSResponseModel";

export interface IAddPartnerSMSModelProps {
  onShow: boolean;
  data: IPartnerSMSResponseModel;
  onHide: (reload: boolean) => void;
}

export interface IPartnerSMSListProps {
  onBackProps: (isBack: boolean) => void;
}
