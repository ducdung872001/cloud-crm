import { IFunctionalManagementResponse } from "./FunctionalManagementResponse";

export interface IFunctionalManagementListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface IAddFunctionalManagementModalProps {
  onShow: boolean;
  data?: IFunctionalManagementResponse;
  onHide: (reload: boolean) => void;
}
