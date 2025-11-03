import { IWarrantyCategoryResponse } from "./WarrantyCategoryResponseModel";

export interface IAddSettingWarrantyModalProps {
  onShow: boolean;  
  data?: IWarrantyCategoryResponse;
  onHide: (reload: boolean) => void;
}
