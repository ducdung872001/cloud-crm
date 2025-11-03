import { IKpiTemplateGoalResponse } from "./KpiTemplateGoalResponseModel";

export interface IKpiTemplateGoalModalProps {
  onShow?: boolean;
  data?: any;
  infoKpiTemplate: any;
  onHide?: (reload: boolean) => void;
  onReload?: (reload: boolean) => void;
}

export interface ITableKpiTemplateGoalProps {
  isLoading: boolean;
  listKpiTemplateGoal: IKpiTemplateGoalResponse[];
  titles: string[];
  dataFormat: string[];
  dataMappingArray: any;
  actionsTable: any;
  setIsActiveForm: any;
  isPermissions: boolean;
}

export interface IAddKpiTemplateGoalModalProps {
  onShow: boolean;  
  data?: IKpiTemplateGoalResponse;
  onHide: (reload: boolean) => void;
}
