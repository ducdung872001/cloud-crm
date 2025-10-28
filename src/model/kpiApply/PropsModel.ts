import { IKpiApplyResponse } from "./KpiApplyResponseModel";

export interface IAddKpiApplyModalProps {
  onShow: boolean;  
  data?: IKpiApplyResponse;
  onHide: (reload: boolean) => void;
}
