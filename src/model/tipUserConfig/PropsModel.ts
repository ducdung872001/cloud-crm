import { ITipUserConfigResponse } from "./TipUserConfigResponseModel";

export interface IAddTipUserConfigModalProps {
  onShow: boolean;
  data?: ITipUserConfigResponse;
  onHide: (reload: boolean) => void;
}

export interface ITipUserConfigListProps {
  onBackProps: (isBack: boolean) => void;
}
