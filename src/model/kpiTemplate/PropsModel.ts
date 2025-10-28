import { IKpiTemplateResponse } from "./KpiTemplateResponseModel";

export interface IAddKpiTemplateModalProps {
  onShow: boolean;  
  data?: IKpiTemplateResponse;
  onHide: (reload: boolean) => void;
}
