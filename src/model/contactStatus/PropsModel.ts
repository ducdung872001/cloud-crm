import { IContactStatusResponse } from "./ContactStatusResponseModel";

export interface IContactStatusModalProps {
  onShow: boolean;
  infoPipeline: any;
  onHide: (reload: boolean) => void;
}

export interface IAddContactStatusProps {
  data: IContactStatusResponse;
  infoPipeline: any;
  onReload: (reload: boolean) => void;
}

export interface ITableContactStatusProps {
  isLoading: boolean;
  listContactStatus: IContactStatusResponse[];
  titles: string[];
  dataFormat: string[];
  dataMappingArray: any;
  actionsTable: any;
  setIsActiveForm: any;
  isPermissions: boolean;
}
