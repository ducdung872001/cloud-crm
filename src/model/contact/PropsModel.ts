import { IContactFilterRequest } from "./ContactRequestModel";
import { IContactResponse } from "./ContactResponseModel";

export interface AddContactModalProps {
  onShow: boolean;
  data?: IContactResponse;
  idCustomer?: number;
  onHide: (reload: boolean) => void;
}

export interface IContactListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface IKanbanContactProps {
  params: IContactFilterRequest;
  setParams: any;
  contractFilterList: any;
  listStatusContact: any;
  data: IContactResponse[];
  onReload: (reload: boolean) => void;
}
