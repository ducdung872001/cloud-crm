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
  setType: any;
  isFullPage: boolean;
  isRegimeKanban: boolean;
  idOptManagement: number;
  setIdOptManagement: any;
  dataProjectReport?: any;
}

export interface IOptManagementItemProps {
  data: IWorkOptResponseModel;
  isShowChildrenOpt: boolean;
  setIsShowChildrenOpt: any;
  idOptManagement: number;
  setIdOptManagement: any;
  setShowModalAdd: any;
  showDialogConfirmDelete: any;
  onReload: (reload: boolean) => void;
}

export interface IAddChildOptModal {
  onShow: boolean;
  idOpt: number;
  idOptManagement?: number;
  callBack: (reload: boolean) => void;
}
