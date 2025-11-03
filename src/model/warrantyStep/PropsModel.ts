import { IWarrantyStepResponse } from "./WarrantyStepResponseModel";

export interface IStepModalProps {
  onShow?: boolean;
  data?: any;
  infoProc: any;
  onHide?: (reload: boolean) => void;
  onReload?: (reload: boolean) => void;
}

export interface ITableStepProps {
  isLoading: boolean;
  listStep: IWarrantyStepResponse[];
  titles: string[];
  dataFormat: string[];
  dataMappingArray: any;
  actionsTable: any;
  setIsActiveForm: any;
  isPermissions: boolean;
}

export interface IAddWarrantyStepModalProps {
  onShow: boolean;  
  data?: IWarrantyStepResponse;
  onHide: (reload: boolean) => void;
}
