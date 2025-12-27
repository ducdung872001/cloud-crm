import { ICustomerSchedulerFilterRequest } from "model/customer/CustomerRequestModel";

export interface ISendSMS {
  type?: string;
  onShow: boolean;
  onHide: (isHide?: boolean) => void;
  onBackProps?: () => void;
  listIdCustomerProps?: number[];
  idSendSMS?: number;
  paramCustomerProps?: ICustomerSchedulerFilterRequest;
  customerIdList?: any;
  isView?: boolean;
}
