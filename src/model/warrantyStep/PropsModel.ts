import { IWarrantyStepResponse } from "./WarrantyStepResponseModel";

export interface IStepModalProps {
  onShow?: boolean;
  data?: IWarrantyStepResponse;
  infoProc: Record<string, unknown>;
  onHide?: (reload: boolean) => void;
  onReload?: (reload: boolean) => void;
}

export interface ITableStepProps {
  isLoading: boolean;
  listStep: IWarrantyStepResponse[];
  titles: string[];
  dataFormat: string[];
  dataMappingArray: string[];
  actionsTable: Record<string, unknown>;
  setIsActiveForm: (isActive: boolean) => void;
  isPermissions: boolean;
}

export interface IAddWarrantyStepModalProps {
  onShow: boolean;  
  data?: IWarrantyStepResponse;
  onHide: (reload: boolean) => void;
}
