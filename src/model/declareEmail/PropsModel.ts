import { IDeclareEmailResponseModel } from "./DeclareEmailResponseModel";

export interface IAddDeclareEmailModelProps {
  onShow: boolean;
  data: IDeclareEmailResponseModel;
  onHide: (reload: boolean) => void;
}

export interface IDeclareEmailListProps {
  onBackProps: (isBack: boolean) => void;
}
