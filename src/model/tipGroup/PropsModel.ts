import { ITipGroupResponse } from "./TipGroupResponseModel";

export interface IAddTipGroupModalProps {
  onShow: boolean;
  data?: ITipGroupResponse;
  tipType?: number;
  onHide: (reload: boolean) => void;
}

export interface AddTipGroupToTipGroupEmployeeModalProps {
  onShow: boolean;
  groupId: number;
  onHide: (reload: boolean) => void;
}

export interface ShowTipGroupToTipGroupEmployeeModalProps {
  onShow: boolean;
  showGroupId: number;
  onHide: (reload: boolean) => void;
}

export interface ITipGroupListProps {
  onBackProps: (isBack: boolean) => void;
}
