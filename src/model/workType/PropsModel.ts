import { IWorkTypeResponse } from "./WorkTypeResponseModel";

export interface IAddWorkTypeModalProps {
  onShow: boolean;
  data?: IWorkTypeResponse;
  onHide: (reload: boolean) => void;
}
