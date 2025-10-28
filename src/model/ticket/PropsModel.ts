import { ITicketFilterRequest, ITicketProcessRequestModel } from "./TicketRequestModel";
import { ITicketExchangeListResponseModel, ITicketResponseModel } from "./TicketResponseModel";

export interface IAddTicketModalProps {
  onShow: boolean;
  data?: ITicketResponseModel;
  idCustomer?: number;
  onHide: (reload: boolean) => void;
  saleflowId?: number;
  sieId?: number;
}

export interface IViewStatusTicketModalProps {
  onShow: boolean;
  idTicket: number;
  onHide: (reload: boolean) => void;
}

export interface IInfoCustomerTicketProps {
  data: ITicketResponseModel;
}

export interface IViewInfoTicketProps {
  data: ITicketResponseModel;
  infoApproved: any;
  onReload: (reload: boolean) => void;
  takeBlockRight: (reload: number) => void;
}

export interface IInfoExchangeTicketProps {
  idTicket: number;
}

export interface IMessageChatTicketProps {
  idTicket: number;
  dataExchangeTicket: ITicketExchangeListResponseModel;
  onReload: (reload: boolean) => void;
}

export interface ITableTicketProps {
  listSaveSearch: any;
  customerFilterList: any;
  params: ITicketFilterRequest;
  setParams: any;
  titles: any;
  listTicket: ITicketResponseModel[];
  pagination: any;
  dataMappingArray: any;
  dataFormat: any;
  listIdChecked: number[];
  setListIdChecked: any;
  bulkActionList: any;
  actionsTable: any;
  isLoading: boolean;
  setDataTicket: any;
  setShowModalAdd: any;
  isNoItem: boolean;
  isPermissions: boolean;
  isService: boolean;
  dataSize: any;
}

export interface ITaskItemProps {
  item: any;
  index: number;
}

export interface IKanbanTicketProps {
  data: ITicketResponseModel[];
  isRegimeKanban: boolean;
}

export interface ITransferExecutorProps {
  onShow: boolean;
  data?: ITicketProcessRequestModel;
  idTicket: number;
  idStatusTicket: number;
  onHide: (reload: boolean) => void;
}
