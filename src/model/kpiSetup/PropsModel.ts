import { IKpiSetupResponse } from "./KpiSetupResponseModel";

export interface IKpiSetupModalProps {
  onShow?: boolean;
  data?: IKpiSetupResponse;
  infoKpi: Record<string, unknown>;
  onHide?: (reload: boolean) => void;
  onReload?: (reload: boolean) => void;
}

export interface ITableKpiSetupProps {
  isLoading: boolean;
  listKpiSetup: IKpiSetupResponse[];
  titles: string[];
  dataFormat: string[];
  dataMappingArray: string[];
  actionsTable: Record<string, unknown>;
  setIsActiveForm: (isActive: boolean) => void;
  isPermissions: boolean;
}

export interface IAddKpiSetupModalProps {
  onShow: boolean;  
  data?: IKpiSetupResponse;
  onHide: (reload: boolean) => void;
}
