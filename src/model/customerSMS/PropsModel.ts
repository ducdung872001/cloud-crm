import { ICustomerSMSResponseModel } from "./CustomerSMSResponseModel";

export interface ICustomerSMSListProps {
  idCustomer: number;
  onShow: boolean;
  callBack: () => void;
}

export interface IAddCustomerSMSModelProps {
  onShow: boolean;
  idCustomer: number;
  data?: ICustomerSMSResponseModel;
  onHide: (reload: boolean) => void;
  callback?: (codes: object) => void;
}
