
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
  params: any;
  setParams: any;
  listSaveSearch: any;
  listFilterItem: any;
  isLoading: boolean;
  listTemplateZalo: ITemplateZaloResponseModel[];
  titles: string[];
  pagination: any;
  dataFormat: string[];
  dataMappingArray: any;
  listIdChecked: number[];
  bulkActionItems: any;
  setListIdChecked: any;
  actionsTable: any;
  isPermissions: boolean;
  setDataTemplateZalo: any;
  isNoItem: boolean;
  setIsAddEditTemplateZalo: any;
}
