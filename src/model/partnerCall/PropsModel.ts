import { IPartnerCallResponseModel } from "./PartnerCallResponseModel";

export interface IAddPartnerCallModelProps {
  onShow: boolean;
  data: IPartnerCallResponseModel;
  onHide: (reload: boolean) => void;
}

export interface IPartnerCallListProps {
  onBackProps: (isBack: boolean) => void;
}
