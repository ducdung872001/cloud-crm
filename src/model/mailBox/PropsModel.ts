import { IListMailboxExchangeResponseModel, IMailBoxResponseModel, IMailboxViewerResponseModel } from "./MailBoxResponseModel";

export interface IHeaderInternalRightMailListProps {
  dataMailbox: IMailBoxResponseModel;
  showDialogConfirmDelete: (id: number) => void;
  isBroadly: boolean;
  setIsBroadly: (isBroadly: boolean) => void;
}

export interface IExchangeContentListProps {
  dataMailbox: IMailBoxResponseModel;
  isBroadly: boolean;
}

export interface IInfoConversationProps {
  data: IMailBoxResponseModel;
}

export interface IAddMailBoxModalProps {
  onShow: boolean;
  data: IMailBoxResponseModel;
  onHide: (reload: boolean) => void;
}
export interface IMessageChatProps {
  mailboxId: number;
  dataExchange: IListMailboxExchangeResponseModel;
  takeHeightTextarea: (height: number) => void;
  onHide: (reload: boolean) => void;
}

export interface IUploadMediaModalProps {
  checkType: string;
  infoMedia: { type: string; url: string };
  onShow: boolean;
  onHideForm: (reload: boolean) => void;
  mailboxId: number;
  content?: string;
  idItem?: number;
  onAddUpload: (upload: boolean) => void;
}

export interface IUploadDocumentModalProps {
  infoDocument: { type: string; url: string; fileSize: number; fileName: string };
  progress: number;
  onShow: boolean;
  content?: string;
  idItem?: number;
  onHideForm: (reload: boolean) => void;
  mailboxId: number;
  onEditUpload: (upload: boolean) => void;
}

export interface IEmojiChatProps {
  onShow: boolean;
  dataMessage: Record<string, unknown>;
  setDataMessage: (data: Record<string, unknown>) => void;
  onHide: (reload: boolean) => void;
}

export interface IAddPeopleInvolvedProps {
  dataProps: IMailboxViewerResponseModel[];
  id: number;
  onReload: (reload: boolean) => void;
}
