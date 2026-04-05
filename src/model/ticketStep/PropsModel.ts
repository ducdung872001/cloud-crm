import { ITicketStepResponse } from "./TicketStepResponseModel";

export interface IStepModalProps {
  onShow?: boolean;
  data?: ITicketStepResponse;
  infoProc: Record<string, unknown>;
  onHide?: (reload: boolean) => void;
  onReload?: (reload: boolean) => void;
}

export interface ITableStepProps {
  isLoading: boolean;
  listStep: ITicketStepResponse[];
  titles: string[];
  dataFormat: string[];
  dataMappingArray: string[];
  actionsTable: Record<string, unknown>;
  setIsActiveForm: (value: boolean) => void;
  isPermissions: boolean;
}

export interface IAddTicketStepModalProps {
  onShow: boolean;  
  data?: ITicketStepResponse;
  onHide: (reload: boolean) => void;
}
