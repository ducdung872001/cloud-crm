import { ICustomerZaloResponseModel } from "./CustomerZaloResponseModel";

export interface ICustomerZaloListProps {
  idCustomer: number;
  customerName: string;
  onShow: boolean;
  callBack: () => void;
}

export interface IAddCustomerZaloModelProps {
  onShow: boolean;
  idCustomer: number;
  data?: ICustomerZaloResponseModel;
  onHide: (reload: boolean) => void;
  callback?: (codes: object) => void;
  type?: string;
}
