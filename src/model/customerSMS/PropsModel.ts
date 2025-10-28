import { ICustomerSMSResponseModel } from "./CustomerSMSResponseModel";

export interface ICustomerSMSListProps {
  idCustomer: number;
  onShow: boolean;
  callBack: any;
}

export interface IAddCustomerSMSModelProps {
  onShow: boolean;
  idCustomer: number;
  data?: ICustomerSMSResponseModel;
  onHide: (reload: boolean) => void;
  callback?: (codes: object) => void;
}
