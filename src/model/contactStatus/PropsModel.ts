import { IContactStatusResponse } from "./ContactStatusResponseModel";

export interface IContactStatusModalProps {
  onShow: boolean;
  infoPipeline: Record<string, unknown>;
  onHide: (reload: boolean) => void;
}

export interface IAddContactStatusProps {
  data: IContactStatusResponse;
  infoPipeline: Record<string, unknown>;
  onReload: (reload: boolean) => void;
}

export interface ITableContactStatusProps {
  isLoading: boolean;
  listContactStatus: IContactStatusResponse[];
  titles: string[];
  dataFormat: string[];
  dataMappingArray: string[];
  actionsTable: Record<string, unknown>;
  setIsActiveForm: (isActive: boolean) => void;
  isPermissions: boolean;
}
