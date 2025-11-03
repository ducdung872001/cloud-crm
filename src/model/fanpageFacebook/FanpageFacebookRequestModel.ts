export interface IFanpageFacebookFilterRequest {
  page?: number;
  limit?: number;
}

export interface IFanpageFacebookRequest {
  id?: number;
  name?: string;
  _fanpage_id?: string;
  accessToken?: string;
  userAccessToken?: string;
  bsnId?: number;
}

export interface IConnectFanpageFilterRequest {
  accessToken: string;
}

export interface IFanpageDialogFilterRequest {
  name?: string;
  fanpageId?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface IFanpageChatFilterRequest {
  fanpageId?: string;
  profileId?: string;
  page?: number;
  limit?: number;
}

export interface IReplyFanpageChatRequest {
  _fanpage_id: string;
  receiverId: string;
  content: string;
}

export interface IFanpageCommentFilterRequest {
  fanpageId?: string;
  profileId?: string;
  page?: number;
  limit?: number;
}

export interface IReplyFanpageCommentRequest {
  content: string;
  _post_id: string;
  _comment_id: string;
  _reply_comment_id: string;
}

export interface IFanpageChatSendAttachmentRequest {
  fanpageId: string;
  receiverId: string;
  file: any;
}
