import { IPomResponse } from "./PomResponseModel";

export interface IPomModalProps {
  onShow: boolean;
  infoService: Record<string, unknown>;
  onHide: (reload: boolean) => void;
}

export interface IAddPomProps {
  data: IPomResponse;
  infoService: Record<string, unknown>;
  onReload: (reload: boolean) => void;
}

export interface ITablePomProps {
  isLoading: boolean;
  listPom: IPomResponse[];
  titles: string[];
  dataFormat: string[];
  dataMappingArray: string[];
  actionsTable: Record<string, unknown>;
  setIsActiveForm: (isActive: boolean) => void;
  isPermissions: boolean;
}
