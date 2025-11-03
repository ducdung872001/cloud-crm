import { ICustomPlaceholderResponse } from "./CustomPlaceholderResponseModel";

export interface ICustomPlaceholderModalProps {
  onShow: boolean;
  data?: ICustomPlaceholderResponse;
  onHide: (reload: boolean) => void;
}
