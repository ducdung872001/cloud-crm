export interface IMailBoxFilterRequest {
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface IMailboxExchangeFilterRequest {
  mailboxId: number;
  page?: number;
  limit?: number;
}

export interface IMailboxViewerFilterRequest {
  id: number;
}

export interface IMailBoxRequestModel {
  id?: number;
  title?: string;
  content?: string;
  departments?: string;
  employees?: string;
  attachments?: string;
}

export interface IMailBoxViewerRequestModel {
  id?: number;
  employees: string;
}

export interface IMailboxExchangeRequestModel {
  id?: number;
  mailboxId: number;
  content: string;
  contentDelta?: string;
  medias: string;
}
