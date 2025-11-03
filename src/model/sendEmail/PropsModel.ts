import { ICustomerSchedulerFilterRequest } from "model/customer/CustomerRequestModel";

export interface ISendEmail {
  onShow: boolean;
  onHide: (isHide: boolean) => void;
  onBackProps?: () => void;
  listIdCustomerProps?: number[];
  idSendEmail?: number;
  paramCustomerProps?: ICustomerSchedulerFilterRequest;
  customerIdList?: any;
  type?: string;
}
