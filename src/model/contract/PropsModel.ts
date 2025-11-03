import { IContractResponse } from "./ContractResponseModel";
import { IContractFilterRequest, IContractRequest } from "./ContractRequestModel";

export interface AddContractModalProps {
  onShow?: boolean;
  data?: any;
  setDataPaymentBill?: any;
  dataProject?: any;
  idCustomer?: number;
  title?: string;
  onHide?: (reload: boolean) => void;
  setContractId?: any;
  setTab?:any;
  contractId?: number;
  pipelineUrl?: any;
  infoFile?: any;
  setInfoFile?: any;
  listService?: any;
  setListService?: any;
  listLogValue?: any;
  fieldData?: any;
  setFieldData?: any;
  showModalLog?: boolean;
  setShowModalLog?: any;
  callback?: any;
}

export interface IContractListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface IKanbanConstractProps {
  params: IContractFilterRequest;
  setParams: any;
  contractFilterList: any;
  listApproachContract: any;
  data: IContractResponse[];
  onReload: (reload: boolean) => void;
}
