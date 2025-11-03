import { IInstallApplicationResponse } from "./InstallApplicationResponseModel";

export interface IAddApplicationModalProps {
  data?: IInstallApplicationResponse;
  onShow: boolean;
  onHide: (reload: boolean) => void;
}
