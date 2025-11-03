import { IKpiGoalFilterRequest } from "./KpiGoalRequestModel";
import { IKpiGoalResponse } from "./KpiGoalResponseModel";
export interface AddKpiGoalModalProps {
  onShow: boolean;
  data?: IKpiGoalResponse;
  onHide: (reload: boolean) => void;
}

export interface IKpiGoalListProps {
  onBackProps: (isBack: boolean) => void;
}