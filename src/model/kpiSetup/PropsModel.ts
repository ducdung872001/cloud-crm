import { IKpiSetupResponse } from "./KpiSetupResponseModel";

export interface IKpiSetupModalProps {
  onShow?: boolean;
  data?: any;
  infoKpi: any;
  onHide?: (reload: boolean) => void;
  onReload?: (reload: boolean) => void;
}

export interface ITableKpiSetupProps {
  isLoading: boolean;
  listKpiSetup: IKpiSetupResponse[];
  titles: string[];
  dataFormat: string[];
  dataMappingArray: any;
  actionsTable: any;
  setIsActiveForm: any;
  isPermissions: boolean;
}

export interface IAddKpiSetupModalProps {
  onShow: boolean;  
  data?: IKpiSetupResponse;
  onHide: (reload: boolean) => void;
}
