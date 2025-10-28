import { IContractPipelineResponse } from "./ContractPipelineResponseModel";

export interface AddContractPipelineModalProps {
  onShow: boolean;
  data?: IContractPipelineResponse;
  onHide: (reload: boolean) => void;
}

export interface IContractPipelineListProps {
  onBackProps: (isBack: boolean) => void;
}
