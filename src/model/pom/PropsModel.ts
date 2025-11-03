import { IPomResponse } from "./PomResponseModel";

export interface IPomModalProps {
  onShow: boolean;
  infoService: any;
  onHide: (reload: boolean) => void;
}

export interface IAddPomProps {
  data: IPomResponse;
  infoService: any;
  onReload: (reload: boolean) => void;
}

export interface ITablePomProps {
  isLoading: boolean;
  listPom: IPomResponse[];
  titles: string[];
  dataFormat: string[];
  dataMappingArray: any;
  actionsTable: any;
  setIsActiveForm: any;
  isPermissions: boolean;
}
