import { IPositionResponse } from "./PositionResponseModel";

export interface IAddPositionModalProps {
  onShow: boolean;
  data?: IPositionResponse;
  onHide: (reload: boolean) => void;
}

export interface IPositionListProps {
  onBackProps: (isBack: boolean) => void;
}
