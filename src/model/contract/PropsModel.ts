import { IContractResponse } from "./ContractResponseModel";
import { IContractFilterRequest, IContractRequest } from "./ContractRequestModel";

export interface AddContractModalProps {
  onShow?: boolean;
  data?: IContractResponse;
  setDataPaymentBill?: (data: Record<string, unknown>) => void;
  dataProject?: Record<string, unknown>;
  idCustomer?: number;
  title?: string;
  onHide?: (reload: boolean) => void;
  setContractId?: (id: number) => void;
  setTab?: (tab: string) => void;
  contractId?: number;
  pipelineUrl?: string;
  infoFile?: Record<string, unknown>;
  setInfoFile?: (info: Record<string, unknown>) => void;
  listService?: Record<string, unknown>[];
  setListService?: (services: Record<string, unknown>[]) => void;
  listLogValue?: Record<string, unknown>[];
  fieldData?: Record<string, unknown>;
  setFieldData?: (data: Record<string, unknown>) => void;
  showModalLog?: boolean;
  setShowModalLog?: (show: boolean) => void;
  callback?: () => void;
}

export interface IContractListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface IKanbanConstractProps {
  params: IContractFilterRequest;
  setParams: (params: IContractFilterRequest) => void;
  contractFilterList: Record<string, unknown>[];
  listApproachContract: Record<string, unknown>[];
  data: IContractResponse[];
  onReload: (reload: boolean) => void;
}
