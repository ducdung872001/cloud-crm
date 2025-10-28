import { IKpiObjectResponse } from "./KpiObjectResponseModel";

export interface IKpiObjectModalProps {
  onShow?: boolean;
  data?: any;
  infoKpi: any;
  onHide?: (reload: boolean) => void;
  onReload?: (reload: boolean) => void;
}

export interface ITableKpiObjectProps {
  isLoading: boolean;
  listKpiObject: IKpiObjectResponse[];
  titles: string[];
  dataFormat: string[];
  dataMappingArray: any;
  actionsTable: any;
  setIsActiveForm: any;
  isPermissions: boolean;
}

export interface IAddKpiObjectModalProps {
  onShow: boolean;  
  data?: IKpiObjectResponse;
  onHide: (reload: boolean) => void;
}
