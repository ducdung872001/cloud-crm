import { ITipGroupResponse } from "./TipGroupResponseModel";

export interface IAddTipGroupModalProps {
  onShow: boolean;
  data?: ITipGroupResponse;
  onHide: (reload: boolean) => void;
}

export interface ITipGroupListProps {
  onBackProps: (isBack: boolean) => void;
}
