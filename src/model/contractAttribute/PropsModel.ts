import { IContractAttributeResponse } from "./ContractAttributeResponse";

export interface AddContractAttributeModalProps {
  onShow: boolean;
  dataContractAttribute?: IContractAttributeResponse;
  onHide: (reload: boolean) => void;
}

export interface IContractAttributeListProps {
  onBackProps: (isBack: boolean) => void;
}
