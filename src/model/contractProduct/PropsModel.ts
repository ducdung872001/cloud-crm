import { IContractProductResponse } from "./ContractProductResponseModel";

export interface AddContractProductModalProps {
  onShow: boolean;
  data?: IContractProductResponse;
  onHide: (reload: boolean) => void;
}

export interface IContractProductListProps {
  onBackProps: (isBack: boolean) => void;
}
