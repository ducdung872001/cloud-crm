import { ICustomerZaloResponseModel } from "./CustomerZaloResponseModel";

export interface ICustomerZaloListProps {
  idCustomer: number;
  customerName: string;
  onShow: any;
  callBack: any;
}

export interface IAddCustomerZaloModelProps {
  onShow: boolean;
  idCustomer: number;
  data?: ICustomerZaloResponseModel;
  onHide: (reload: boolean) => void;
  callback?: (codes: object) => void;
  type?: any;
}
