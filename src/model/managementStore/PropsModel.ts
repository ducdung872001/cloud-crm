import { IStoreResponse } from "./StoreResponseModel";

export interface AddStoreModalProps {
  onShow: boolean;
  data?: IStoreResponse;
  onHide: (reload: boolean) => void;
}

export interface IStoreProps {
  onBackProps: (isBack: boolean) => void;
}