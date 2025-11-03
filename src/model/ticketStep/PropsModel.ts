import { ITicketStepResponse } from "./TicketStepResponseModel";

export interface IStepModalProps {
  onShow?: boolean;
  data?: any;
  infoProc: any;
  onHide?: (reload: boolean) => void;
  onReload?: (reload: boolean) => void;
}

export interface ITableStepProps {
  isLoading: boolean;
  listStep: ITicketStepResponse[];
  titles: string[];
  dataFormat: string[];
  dataMappingArray: any;
  actionsTable: any;
  setIsActiveForm: any;
  isPermissions: boolean;
}

export interface IAddTicketStepModalProps {
  onShow: boolean;  
  data?: ITicketStepResponse;
  onHide: (reload: boolean) => void;
}
