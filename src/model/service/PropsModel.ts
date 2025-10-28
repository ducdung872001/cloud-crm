import { IServiceFilterRequest } from "./ServiceRequestModel";
import { IServiceRespone } from "./ServiceResponseModel";

export interface IAddServiceModalProps {
  onShow: boolean;
  data?: IServiceRespone;
  onHide: (reload: boolean) => void;
}

export interface IAddPriceServiceProps {
  onShow: boolean;
  handleTakePriceVariant: any;
  dataProps: string;
  onHide: (reload: boolean) => void;
}

export interface IServiceListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface ITabelServiceProps {
  titles: any;
  customerFilterList: any;
  params: IServiceFilterRequest;
  setParams: any;
  listService: IServiceRespone[];
  pagination: any;
  dataMappingArray: any;
  dataFormat: any;
  listIdChecked: number[];
  setListIdChecked: any;
  bulkActionList: any;
  actionsTable: any;
  isLoading: boolean;
  setDataService: any;
  isNoItem: boolean;
  listSaveSearch: any;
  isPermissions: boolean;
  tab: any;
  setTab: any;
  listTabs: any;
  listPartner: any;
  paginationPartner: any;
  targetBsnId: any;
  handlClickPartner: any;
  paramsServicePartner: any;
  setParamsServicePartner: any;
  setIsConfigIntegrateModal: any;
}
