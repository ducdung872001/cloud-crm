export interface IZaloOAConnectFilterRequest {
  code: string;
  oaId: string;
}

export interface IZaloOAFilterRequest {
  page?: number;
  limit?: number;
}

export interface IZaloFollowerFilterRequest {
  keyword: string;
  oaId?: string;
  page?: number;
  limit?: number;
}

export interface IZaloChatFilterRequest {
  oaId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface ISendZaloChatRequest {
  userIdByApp: string;
  message: string;
}

export interface ILinkImageSendZaloChatRequest {
  userIdByApp: string;
  linkImage: string;
  message: string;
}

export interface IFileSendZaloChatRequest {
  userIdByApp: string;
  file: any;
}

export interface IAnswerSendZaloChatRequest {
  userIdByApp: string;
  message: string;
  quoteMessageId: string;
}
