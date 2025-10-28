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
  infoApproved: any;
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
  customerFilterList: any;
  params: IPurchaseFilterRequest;
  setParams: any;
  titles: any;
  listPurchase: IPurchaseResponseModel[];
  pagination: any;
  dataMappingArray: any;
  dataFormat: any;
  listIdChecked: number[];
  setListIdChecked: any;
  bulkActionList: any;
  actionsTable: any;
  isLoading: boolean;
  setDataPurchase: any;
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
