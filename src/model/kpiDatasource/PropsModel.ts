import { IKpiDatasourceResponse } from "./KpiDatasourceResponseModel";

export interface AddKpiDatasourceModalProps {
  onShow: boolean;
  data?: IKpiDatasourceResponse;
  onHide: (reload: boolean) => void;
}

export interface IBranchListProps {
  onBackProps: (isBack: boolean) => void;
}
