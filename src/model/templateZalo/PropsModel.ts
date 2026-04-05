
import { ITemplateZaloResponseModel } from "./TemplateZaloResponseModel";

export interface IAddTemplateEmailModelProps {
  onShow: boolean;
  data?: ITemplateZaloResponseModel;
  onHide: (reload: boolean) => void;
}

export interface ITemplateZaloListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface ITableTemplateZaloProps {
  params: Record<string, unknown>;
  setParams: (params: Record<string, unknown>) => void;
  listSaveSearch: Record<string, unknown>[];
  listFilterItem: Record<string, unknown>[];
  isLoading: boolean;
  listTemplateZalo: ITemplateZaloResponseModel[];
  titles: string[];
  pagination: Record<string, unknown>;
  dataFormat: string[];
  dataMappingArray: string[];
  listIdChecked: number[];
  bulkActionItems: Record<string, unknown>[];
  setListIdChecked: (ids: number[]) => void;
  actionsTable: Record<string, unknown>[];
  isPermissions: boolean;
  setDataTemplateZalo: (data: ITemplateZaloResponseModel) => void;
  isNoItem: boolean;
  setIsAddEditTemplateZalo: (show: boolean) => void;
}
