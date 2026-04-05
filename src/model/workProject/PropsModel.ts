import { IWorkProjectResponseModel } from "./WorkProjectResponseModel";

export interface IAddWorkProjectModalProps {
  startDate: Date | string;
  endDate?: Date | string;
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
  setType: (type: string) => void;
  isFullPage: boolean;
  isRegimeKanban: boolean;
  idProjectManagement: number;
  setIdProjectManagement: (id: number) => void;
}

export interface IProjectManagementItemProps {
  data: IWorkProjectResponseModel;
  isShowChildrenProject: boolean;
  setIsShowChildrenProject: (show: boolean) => void;
  idProjectManagement: number;
  setIdProjectManagement: (id: number) => void;
  setShowModalAdd: (show: boolean) => void;
  showDialogConfirmDelete: (id: number) => void;
  onReload: (reload: boolean) => void;
}

export interface IAddChildProjectModal {
  onShow: boolean;
  idProject: number;
  idProjectManagement?: number;
  callBack: (reload: boolean) => void;
}
