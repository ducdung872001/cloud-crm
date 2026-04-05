import { IWorkOptResponseModel } from "./WorkOptResponseModel";

export interface IAddWorkOptModalProps {
  onShow: boolean;
  idData?: number;
  onHide: (reload: boolean) => void;
}

export interface IViewOptManagementModalProps {
  onShow: boolean;
  idOptManagement: number;
  onHide: () => void;
}

export interface IOptManagementListProps {
  setType: (type: string | number) => void;
  isFullPage: boolean;
  isRegimeKanban: boolean;
  idOptManagement: number;
  setIdOptManagement: (id: number) => void;
  dataProjectReport?: Record<string, unknown>;
}

export interface IOptManagementItemProps {
  data: IWorkOptResponseModel;
  isShowChildrenOpt: boolean;
  setIsShowChildrenOpt: (show: boolean) => void;
  idOptManagement: number;
  setIdOptManagement: (id: number) => void;
  setShowModalAdd: (show: boolean) => void;
  showDialogConfirmDelete: (id: number) => void;
  onReload: (reload: boolean) => void;
}

export interface IAddChildOptModal {
  onShow: boolean;
  idOpt: number;
  idOptManagement?: number;
  callBack: (reload: boolean) => void;
}
