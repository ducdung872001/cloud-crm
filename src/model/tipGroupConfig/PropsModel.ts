import { ITipGroupConfigResponse } from "./TipGroupConfigResponseModel";

export interface IAddTipGroupConfigModalProps {
  onShow: boolean;
  data?: ITipGroupConfigResponse;
  onHide: (reload: boolean) => void;
}

export interface ITipGroupConfigListProps {
  onBackProps: (isBack: boolean) => void;
}
