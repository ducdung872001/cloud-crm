import { ITemplateEmailResponseModel } from "./TemplateEmailResponseModel";

export interface IAddTemplateEmailModelProps {
  onShow: boolean;
  data?: ITemplateEmailResponseModel;
  onHide: (reload?: boolean) => void;
  callback?: any //Hàm gọi về sau khi được chọn mẫu
}

export interface ITemplateEmailListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface ITableTemplateEmailProps {
  params: any;
  setParams: any;
  listSaveSearch: any;
  listFilterItem: any;
  isLoading: boolean;
  listTemplateEmail: ITemplateEmailResponseModel[];
  titles: string[];
  pagination: any;
  dataFormat: string[];
  dataMappingArray: any;
  listIdChecked: number[];
  bulkActionItems: any;
  setListIdChecked: any;
  actionsTable: any;
  isPermissions: boolean;
  setDataTemplateEmail: any;
  isNoItem: boolean;
}
