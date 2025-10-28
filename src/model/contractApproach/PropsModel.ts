import { IContractApproachResponse } from "./ContractApproachResponseModel";

export interface IContractApproachModalProps {
  onShow: boolean;
  infoPipeline: any;
  onHide: (reload: boolean) => void;
}

export interface IAddContractApproachProps {
  data: IContractApproachResponse;
  infoPipeline: any;
  onReload: (reload: boolean) => void;
}

export interface ITableContractApproachProps {
  isLoading: boolean;
  listContractApproach: IContractApproachResponse[];
  titles: string[];
  dataFormat: string[];
  dataMappingArray: any;
  actionsTable: any;
  setIsActiveForm: any;
  isPermissions: boolean;
}
