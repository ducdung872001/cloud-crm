import { IWorkOrderResponseModel } from "./WorkOrderResponseModel";
import { IWorkOrderFilterRequest } from "./WorkOrderRequestModel";

export interface IAddWorkModelProps {
  type?: "project" | "opportunity";
  onShow: boolean;
  idManagement?: number;
  idWork?: number;
  startDate?: string;
  endDate?: string;
  onHide: (reload: boolean) => void;
  dataEmployeeProps?: Record<string, unknown>;
  dataProjectProps?: Record<string, unknown>;
  dataOptProps?: Record<string, unknown>;
  dataManagerProps?: Record<string, unknown>;
  statusProps?: number;
  customerId?: number;
  customerName?: string;
  isShowProject?: boolean;
  disableOpportunity?: boolean;
}

export interface IListWorkProps {
  type: "project" | "opportunity";
  idManagement?: number;
  isRegimeKanban: boolean;
  isRegimeReport?: boolean;
  isFullPage?: boolean;
  handleDetailWork: (id: number) => void;
  setIsDetailWork: (isDetail: boolean) => void;
  abortController: AbortController;
  isExportWork: boolean;
  onHideExport: () => void;
  showProjectManagement?: boolean;
  setIsFullPage?: (isFull: boolean) => void;
  dataProjectReport?: Record<string, unknown>;
}

export interface ITableWorkOrderProps {
  listSaveSearch: Record<string, unknown>[];
  customerFilterList: Record<string, unknown>[];
  params: IWorkOrderFilterRequest;
  setParams: (params: IWorkOrderFilterRequest) => void;
  titles: Record<string, unknown>[];
  listWork: IWorkOrderResponseModel[];
  pagination: Record<string, unknown>;
  dataMappingArray: Record<string, unknown>[];
  dataFormat: Record<string, unknown>;
  listIdChecked: number[];
  setListIdChecked: (ids: number[]) => void;
  bulkActionList: Record<string, unknown>[];
  actionsTable: Record<string, unknown>[];
  isLoading: boolean;
  setIdWork: (id: number) => void;
  setShowModalAdd: (show: boolean) => void;
  isNoItem: boolean;
}
export interface ITableWorkInColapsedProps {
  paramsFilter: Record<string, unknown>;
  isOpen: boolean;
  setIdWork?: (id: number) => void;
  setShowModalAdd?: (show: boolean) => void;
  setShowModalAssign?: (show: boolean) => void;
  setShowModalDetail?: (show: boolean) => void;
  onReload?: (reload: boolean) => void;
  onReopen?: () => void;
}

export interface IKanbanWorkProps {
  isKanban: boolean;
  params: IWorkOrderFilterRequest;
  setParams: (params: IWorkOrderFilterRequest) => void;
  customerFilterList: Record<string, unknown>[];
  data: IWorkOrderResponseModel[];
  changeValueFilterByKanban: (data: string) => void;
  onReload: (reload: boolean) => void;
}

export interface IDetailWorkProps {
  idData: number;
}

export interface IUpdatePeopleInvolvedProps {
  data: IWorkOrderResponseModel;
}

export interface IAddParticipantModalProps {
  onShow: boolean;
  idWork: number;
  listIdParticipant: number[];
  onHide: (reload: boolean) => void;
}

export interface IAddRelatedCustomerModalProps {
  onShow: boolean;
  idWork: number;
  listIdRelatedCustomer: number[];
  onHide: (reload: boolean) => void;
}

export interface IUpdateRelatedWorkProps {
  data: IWorkOrderResponseModel;
}

export interface IAddRelatedWorkModelProps {
  onShow: boolean;
  idWork: number;
  listIdRelatedWork: number[];
  onHide: (reload: boolean) => void;
}

export interface ITaskItemProps {
  item: Record<string, unknown>;
  index: number;
  totalTask?: number;
  column: Record<string, unknown>;
}

export interface IAddWorkInprogressModalProps {
  onShow: boolean;
  idWork: number;
  onHide: (reload: boolean) => void;
}

export interface IViewWorkInprogressModalProps {
  onShow: boolean;
  idWork: number;
  onHide: () => void;
}

export interface IViewWorkModalProps {
  idWork: number;
  onShow: boolean;
  onHide: (reload: boolean) => void;
}

export interface IAddWorkRatingModalProps {
  idWork: number;
  onShow: boolean;
  disabledRating: boolean;
  numberRating: number;
  data: Record<string, unknown>;
  onHide: (reload: boolean) => void;
}

export interface ISupportTaskModalProps {
  onShow: boolean;
  onHide: () => void;
}
