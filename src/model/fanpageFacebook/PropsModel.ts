import { IFanpageDialogResponse, IFanpageFacebookResponse, IZaloDialogResponse } from "./FanpageResponseModel";

export interface AddFanpageModalProps {
  onShow: boolean;
  listFanpageFacebook?: IFanpageFacebookResponse[];
  data?: IFanpageFacebookResponse[];
  onHide: (reload: boolean) => void;
}

export interface ITableFanpageFacebookProps {
  listFanpageFacebook: IFanpageFacebookResponse[];
  isLoading: boolean;
  isPermissionsFacebook: boolean;
  dataPagination: any;
  callback: any;
}

export interface LoginFanpageModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  loadFanpages: (accessToken: string) => void;
}

export interface IMessageChatProps {
  data?: any;
  takeHeightTextarea: (height: number) => void;
  onHide: (reload: boolean) => void;
}

interface ITabProps {
  name: string;
  type: string;
}

export interface IListChatProps {
  dataFanpageDialog: IFanpageDialogResponse;
  tab: ITabProps;
  onClick: () => void
}

export interface IListChatZaloProps {
  dataFanpageDialog: IZaloDialogResponse;
  onClick: () => void
}

export interface IListCommentProps {
  dataFanpageDialog: IFanpageDialogResponse;
  tab: ITabProps;
}
