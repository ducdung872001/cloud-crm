import { ITemplateEmailResponseModel } from "./TemplateEmailResponseModel";

export interface IAddTemplateEmailModelProps {
  onShow: boolean;
  data?: ITemplateEmailResponseModel;
  onHide: (reload?: boolean) => void;
  callback?: (data: ITemplateEmailResponseModel) => void;
}

export interface ITemplateEmailListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface ITableTemplateEmailProps {
  params: Record<string, unknown>;
  setParams: (params: Record<string, unknown>) => void;
  listSaveSearch: Record<string, unknown>[];
  listFilterItem: Record<string, unknown>[];
  isLoading: boolean;
  listTemplateEmail: ITemplateEmailResponseModel[];
  titles: string[];
  pagination: Record<string, unknown>;
  dataFormat: string[];
  dataMappingArray: string[];
  listIdChecked: number[];
  bulkActionItems: Record<string, unknown>[];
  setListIdChecked: (ids: number[]) => void;
  actionsTable: Record<string, unknown>[];
  isPermissions: boolean;
  setDataTemplateEmail: (data: ITemplateEmailResponseModel) => void;
  isNoItem: boolean;
}
