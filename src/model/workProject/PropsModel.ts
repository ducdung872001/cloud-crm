import { IWorkProjectResponseModel } from "./WorkProjectResponseModel";

export interface IAddWorkProjectModalProps {
  onShow: boolean;
  idData?: number;
  onHide: (reload: boolean) => void;
}

export interface IViewProjectManagementModalProps {
  onShow: boolean;
  idProjectManagement: number;
  idOptManagement?: number;
  onHide: () => void;
}

export interface IProjectManagementListProps {
  setType: any;
  isFullPage: boolean;
  isRegimeKanban: boolean;
  idProjectManagement: number;
  setIdProjectManagement: any;
}

export interface IProjectManagementItemProps {
  data: IWorkProjectResponseModel;
  isShowChildrenProject: boolean;
  setIsShowChildrenProject: any;
  idProjectManagement: number;
  setIdProjectManagement: any;
  setShowModalAdd: any;
  showDialogConfirmDelete: any;
  onReload: (reload: boolean) => void;
}

export interface IAddChildProjectModal {
  onShow: boolean;
  idProject: number;
  idProjectManagement?: number;
  callBack: (reload: boolean) => void;
}
