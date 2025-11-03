import { ICustomerAttributeResponse } from "./CustomerAttributeResponse";

export interface AddCustomerAttributeModalProps {
  onShow: boolean;
  data?: ICustomerAttributeResponse;
  onHide: (reload: boolean) => void;
}

export interface ICustomerAttributeListProps {
  onBackProps: (isBack: boolean) => void;
}
