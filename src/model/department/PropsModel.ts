import { IDepartmentFilterRequest } from "./DepartmentRequestModel";
import { IDepartmentResponse } from "./DepartmentResponseModel";
export interface AddDepartmentModalProps {
  onShow: boolean;
  idDepartment: number;
  onHide: (reload: boolean) => void;
}

export interface IViewConfigDepartmentProps {
  data: IDepartmentResponse;
  onHide: (reload: boolean) => void;
}

export interface IViewDetailDepartmentModalProps {
  onShow: boolean;
  idDepartment: number;
  onHide: (reload: boolean) => void;
}

export interface IViewEmployeeInDepartmentProps {
  onShow: boolean;
  data: IDepartmentResponse;
  onHide: (reload: boolean) => void;
  handleNextPage: () => void;
}

export interface IDepartmentDirectoryListProps {
  onBackProps: (isBack: boolean) => void;
  onNextPage: () => void;
}

export interface ITableDepartmentProps {
  titles: Record<string, unknown>[];
  listDepartment: IDepartmentResponse[];
  params: IDepartmentFilterRequest;
  setParams: (params: IDepartmentFilterRequest) => void;
  pagination: Record<string, unknown>;
  dataMappingArray: Record<string, unknown>[];
  dataFormat: Record<string, unknown>;
  listIdChecked: number[];
  setListIdChecked: (ids: number[]) => void;
  bulkActionList: Record<string, unknown>[];
  actionsTable: Record<string, unknown>[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setIdDepartment: (id: number) => void;
  departmentFilterList: Record<string, unknown>[];
  setShowModalAdd: (show: boolean) => void;
  isNoItem: boolean;
  listSaveSearch: Record<string, unknown>[];
  listTabs: Record<string, unknown>[];
  tab: string;
  setTab: (tab: string) => void;
  isPermissions: boolean;
  dataSize: Record<string, unknown>[];
  setShowModalEditParentDepartment: (show: boolean) => void;
  loadOptionBranch: Record<string, unknown>[];
  handleChangeValueBranch: (value: unknown) => void;
  valueBranch: unknown;
  setValueBranch: (value: unknown) => void;
}

export interface IChooseJobTitleDifferentModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data: Record<string, unknown>;
  listData: Record<string, unknown>[];
  sourceDepartmentId: number;
}

export interface IChooseDepartmentDifferentModalProps {
  onShow: boolean;
  sourceDepartmentId: number;
  nameDepartment: string;
  listJobTitleProps: Record<string, unknown>[];
  onHide: (reload: boolean) => void;
}
