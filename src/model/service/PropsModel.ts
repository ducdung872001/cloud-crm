import { IServiceFilterRequest } from "./ServiceRequestModel";
import { IServiceRespone } from "./ServiceResponseModel";

export interface IAddServiceModalProps {
  onShow: boolean;
  data?: IServiceRespone;
  onHide: (reload: boolean) => void;
}

export interface IAddPriceServiceProps {
  onShow: boolean;
  handleTakePriceVariant: (data: string) => void;
  dataProps: string;
  onHide: (reload: boolean) => void;
}

export interface IServiceListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface ITabelServiceProps {
  titles: Record<string, unknown>[];
  customerFilterList: Record<string, unknown>[];
  params: IServiceFilterRequest;
  setParams: (params: IServiceFilterRequest) => void;
  listService: IServiceRespone[];
  pagination: Record<string, unknown>;
  dataMappingArray: Record<string, unknown>[];
  dataFormat: Record<string, unknown>;
  listIdChecked: number[];
  setListIdChecked: (ids: number[]) => void;
  bulkActionList: Record<string, unknown>[];
  actionsTable: Record<string, unknown>[];
  isLoading: boolean;
  setDataService: (data: IServiceRespone) => void;
  isNoItem: boolean;
  listSaveSearch: Record<string, unknown>[];
  isPermissions: boolean;
  tab: string;
  setTab: (tab: string) => void;
  listTabs: Record<string, unknown>[];
  listPartner: Record<string, unknown>[];
  paginationPartner: Record<string, unknown>;
  targetBsnId: number;
  handlClickPartner: (partner: Record<string, unknown>) => void;
  paramsServicePartner: Record<string, unknown>;
  setParamsServicePartner: (params: Record<string, unknown>) => void;
  setIsConfigIntegrateModal: (show: boolean) => void;
}
