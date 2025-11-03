import { ISettingResponse } from "./SettingResponseModel";

export interface AddSettingProps {
  onShow: boolean;
  data?: ISettingResponse;
  onHide: (reload: boolean) => void;
}
