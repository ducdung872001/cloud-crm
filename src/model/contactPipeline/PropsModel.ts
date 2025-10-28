import { IContactPipelineResponse } from "./ContactPipelineResponseModel";

export interface AddContactPipelineModalProps {
  onShow: boolean;
  data?: IContactPipelineResponse;
  onHide: (reload: boolean) => void;
}

export interface IContactPipelineListProps {
  onBackProps: (isBack: boolean) => void;
}
