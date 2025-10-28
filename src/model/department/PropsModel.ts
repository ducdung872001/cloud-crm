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
  titles: any;
  listDepartment: IDepartmentResponse[];
  params: IDepartmentFilterRequest;
  setParams: any;
  pagination: any;
  dataMappingArray: any;
  dataFormat: any;
  listIdChecked: number[];
  setListIdChecked: any;
  bulkActionList: any;
  actionsTable: any;
  isLoading: boolean;
  setIsLoading: any;
  setIdDepartment: any;
  departmentFilterList: any;
  setShowModalAdd: any;
  isNoItem: boolean;
  listSaveSearch: any;
  listTabs: any;
  tab: any;
  setTab: any;
  isPermissions: boolean;
  dataSize: any[];
  setShowModalEditParentDepartment: any;
  loadOptionBranch: any;
  handleChangeValueBranch: any;
  valueBranch: any;
  setValueBranch: any;
}

export interface IChooseJobTitleDifferentModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data: any;
  listData: any[];
  sourceDepartmentId: number;
}

export interface IChooseDepartmentDifferentModalProps {
  onShow: boolean;
  sourceDepartmentId: number;
  nameDepartment: string;
  listJobTitleProps: any[];
  onHide: (reload: boolean) => void;
}
