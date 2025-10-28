import { IInventoryResponse } from "./InventoryResponseModel";

export interface AddInventoryModalProps {
  onShow: boolean;
  data?: IInventoryResponse;
  onHide: (reload: boolean) => void;
}
