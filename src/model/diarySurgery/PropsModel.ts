import { IDiarySurgeryResponseModel } from "./DiarySurgeryResponseModel";

export interface IAddDiarySurgeryModelProps {
  onShow: boolean;
  data?: IDiarySurgeryResponseModel;
  onHide: (reload: boolean) => void;
}
