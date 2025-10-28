import { ICustomerResponse } from "model/customer/CustomerResponseModel";

export interface ICustomerEmailListProps {
  dataCustomer: ICustomerResponse;
  onShow: boolean;
  callBack: any;
}

export interface IAddCustomerEmailModelProps {
  onShow: boolean;
  dataCustomer: ICustomerResponse;
  onHide: (reload: boolean) => void;
  callback?: (codes: object) => void;
}
