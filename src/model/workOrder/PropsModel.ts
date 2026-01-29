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
  // đoạn này là tham số từ kanban fill vào
  dataEmployeeProps?: any;
  dataProjectProps?: any;
  dataOptProps?: any;
  dataManagerProps?: any;
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
  handleDetailWork: any;
  setIsDetailWork: any;
  abortController: any;
  isExportWork: boolean;
  onHideExport: () => void;
  showProjectManagement?: any;
  setIsFullPage?: any;
  dataProjectReport?: any;
}

export interface ITableWorkOrderProps {
  listSaveSearch: any;
  customerFilterList: any;
  params: IWorkOrderFilterRequest;
  setParams: any;
  titles: any;
  listWork: IWorkOrderResponseModel[];
  pagination: any;
  dataMappingArray: any;
  dataFormat: any;
  listIdChecked: number[];
  setListIdChecked: any;
  bulkActionList: any;
  actionsTable: any;
  isLoading: boolean;
  setIdWork: any;
  setShowModalAdd: any;
  isNoItem: boolean;
}
export interface ITableWorkInColapsedProps {
  paramsFilter: any;
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
  setParams: any;
  customerFilterList: any;
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
  item: any;
  index: number;
  totalTask?: number;
  column: any;
}

// Cập nhật tiến độ công việc
export interface IAddWorkInprogressModalProps {
  onShow: boolean;
  idWork: number;
  onHide: (reload: boolean) => void;
}

// Hiển thị danh sách cập nhật tiến độ công việc
export interface IViewWorkInprogressModalProps {
  onShow: boolean;
  idWork: number;
  onHide: () => void;
}

//Hiển thị modal chi tiết công việc
export interface IViewWorkModalProps {
  idWork: number;
  onShow: boolean;
  onHide: (reload: boolean) => void;
}

// Cập nhật đánh giá công việc
export interface IAddWorkRatingModalProps {
  idWork: number;
  onShow: boolean;
  disabledRating: boolean;
  numberRating: number;
  data: any;
  onHide: (reload: boolean) => void;
}

// Hiển thị modal hướng dẫn kéo thả công việc
export interface ISupportTaskModalProps {
  onShow: boolean;
  onHide: () => void;
}
