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
  infoApproved: Record<string, unknown>;
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
  listSaveSearch: Record<string, unknown>[];
  customerFilterList: Record<string, unknown>[];
  params: ITicketFilterRequest;
  setParams: (params: ITicketFilterRequest) => void;
  titles: string[];
  listTicket: ITicketResponseModel[];
  pagination: Record<string, unknown>;
  dataMappingArray: string[];
  dataFormat: string[];
  listIdChecked: number[];
  setListIdChecked: (ids: number[]) => void;
  bulkActionList: Record<string, unknown>[];
  actionsTable: Record<string, unknown>[];
  isLoading: boolean;
  setDataTicket: (data: ITicketResponseModel) => void;
  setShowModalAdd: (show: boolean) => void;
  isNoItem: boolean;
  isPermissions: boolean;
  isService: boolean;
  dataSize: Record<string, unknown>;
}

export interface ITaskItemProps {
  item: Record<string, unknown>;
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
