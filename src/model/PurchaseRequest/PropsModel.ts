import { IPurchaseFilterRequest, IPurchaseProcessRequestModel } from "./PurchaseRequestModel";
import { IPurchaseExchangeListResponseModel, IPurchaseResponseModel } from "./PurchaseResponseModel";

export interface IAddPurchaseModalProps {
  onShow: boolean;
  data?: IPurchaseResponseModel;
  idCustomer?: number;
  onHide: (reload: boolean) => void;
  saleflowId?: number;
  sieId?: number;
  potId?: number;
}

export interface IViewStatusPurchaseModalProps {
  onShow: boolean;
  idPurchase: number;
  onHide: (reload: boolean) => void;
}

export interface IInfoCustomerPurchaseProps {
  data: IPurchaseResponseModel;
}

export interface IViewInfoPurchaseProps {
  data: IPurchaseResponseModel;
  infoApproved: Record<string, unknown>;
  onReload: (reload: boolean) => void;
  takeBlockRight: (reload: number) => void;
}

export interface IInfoExchangePurchaseProps {
  idPurchase: number;
}

export interface IMessageChatPurchaseProps {
  idPurchase: number;
  dataExchangePurchase: IPurchaseExchangeListResponseModel;
  onReload: (reload: boolean) => void;
}

export interface ITablePurchaseProps {
  // listSaveSearch: any;
  // setListSaveSearch?: any;
  customerFilterList: Record<string, unknown>[];
  params: IPurchaseFilterRequest;
  setParams: (params: IPurchaseFilterRequest) => void;
  titles: string[];
  listPurchase: IPurchaseResponseModel[];
  pagination: Record<string, unknown>;
  dataMappingArray: string[];
  dataFormat: string[];
  listIdChecked: number[];
  setListIdChecked: (ids: number[]) => void;
  bulkActionList: Record<string, unknown>[];
  actionsTable: Record<string, unknown>[];
  isLoading: boolean;
  setDataPurchase: (data: IPurchaseResponseModel) => void;
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

export interface IKanbanPurchaseProps {
  data: IPurchaseResponseModel[];
  isRegimeKanban: boolean;
}

export interface ITransferExecutorProps {
  onShow: boolean;
  data?: IPurchaseProcessRequestModel;
  idPurchase: number;
  idStatusPurchase: number;
  onHide: (reload: boolean) => void;
}
