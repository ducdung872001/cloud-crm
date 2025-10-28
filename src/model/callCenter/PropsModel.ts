import { ICustomerResponse } from "model/customer/CustomerResponseModel";

interface ITabModel {
  name: string;
  status: number;
  namePagination: string;
}

export interface IAddPhoneModalProps {
  onShow: boolean;
  dataCustomer: ICustomerResponse;
  onHide: () => void;
}

export interface ICallHistoryProps {
  tab: ITabModel;
}

export interface ICustomerListProps {
  tab: ITabModel;
  reload: boolean;
  setReload: any
}
