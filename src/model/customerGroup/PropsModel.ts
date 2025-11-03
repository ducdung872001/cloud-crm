import { ICustomerGroupResponse } from "./CustomerGroupResponseModel";

export interface AddCustomerGroupModalProps {
  onShow: boolean;
  data?: ICustomerGroupResponse;
  onHide: (reload: boolean) => void;
}

export interface ICustomerGroupListProps {
  onBackProps: (isBack: boolean) => void;
}
