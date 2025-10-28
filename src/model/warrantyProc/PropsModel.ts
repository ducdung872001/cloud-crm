import { IWarrantyProcResponse } from "./WarrantyProcResponseModel";

export interface IAddWarrantyProcModalProps {
  onShow: boolean;  
  data?: IWarrantyProcResponse;
  onHide: (reload: boolean) => void;
}
