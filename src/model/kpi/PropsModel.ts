import { IKpiResponse } from "./KpiResponseModel";

export interface IAddKpiModalProps {
  onShow: boolean;  
  data?: IKpiResponse;
  onHide: (reload: boolean) => void;
}
