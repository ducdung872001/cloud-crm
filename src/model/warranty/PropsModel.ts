import { IWarrantyFilterRequest, IWarrantyProcessRequestModel } from "./WarrantyRequestModel";
import { IWarrantyExchangeListResponseModel, IWarrantyResponseModel } from "./WarrantyResponseModel";

export interface IAddWarrantyModelProps {
  onShow: boolean;
  data?: IWarrantyResponseModel;
  idCustomer?: number;
  onHide: (reload: boolean) => void;
  saleflowId?: number;
  sieId?: number;
}

export interface IViewStatusWarrantyModalProps {
  onShow: boolean;
  idWarranty: number;
  onHide: (reload: boolean) => void;
}

export interface IInfoCustomerWarrantyProps {
  data: IWarrantyResponseModel;
}

export interface IViewInfoWarrantyProps {
  data: IWarrantyResponseModel;
  infoApproved: Record<string, unknown>;
  onReload: (reload: boolean) => void;
  takeBlockRight: (reload: number) => void;
}

export interface IInfoExchangeWarrantyProps {
  idWarranty: number;
}

export interface IMessageChatWarrantyProps {
  idWarranty: number;
  dataExchangeWarranty: IWarrantyExchangeListResponseModel;
  onReload: (reload: boolean) => void;
}

export interface ITableWarrantyProps {
  listSaveSearch: Record<string, unknown>[];
  customerFilterList: Record<string, unknown>[];
  params: IWarrantyFilterRequest;
  setParams: (params: IWarrantyFilterRequest) => void;
  titles: string[];
  listWarranty: IWarrantyResponseModel[];
  pagination: Record<string, unknown>;
  dataMappingArray: string[];
  dataFormat: string[];
  listIdChecked: number[];
  setListIdChecked: (ids: number[]) => void;
  bulkActionList: Record<string, unknown>[];
  actionsTable: Record<string, unknown>[];
  isLoading: boolean;
  setDataWarranty: (data: IWarrantyResponseModel) => void;
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

export interface IKanbanWarrantyProps {
  data: IWarrantyResponseModel[];
}

export interface ITransferExecutorProps {
  onShow: boolean;
  data?: IWarrantyProcessRequestModel;
  idWarranty: number;
  idStatusWarranty: number;
  onHide: (reload: boolean) => void;
}
