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
  infoApproved: any;
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
  listSaveSearch: any;
  customerFilterList: any;
  params: IWarrantyFilterRequest;
  setParams: any;
  titles: any;
  listWarranty: IWarrantyResponseModel[];
  pagination: any;
  dataMappingArray: any;
  dataFormat: any;
  listIdChecked: number[];
  setListIdChecked: any;
  bulkActionList: any;
  actionsTable: any;
  isLoading: boolean;
  setDataWarranty: any;
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
