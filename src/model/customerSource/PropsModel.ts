import { ICustomerSourceResponse } from "./CustomerSourceResponse";

export interface AddCustomerSourceModalProps {
  onShow: boolean;
  data?: ICustomerSourceResponse;
  onHide: (reload: boolean) => void;
}

export interface ICustomerResourcesListProps {
  onBackProps: (isBack: boolean) => void;
}
