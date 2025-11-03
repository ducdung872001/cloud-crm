export interface IFanpageFacebookResponse {
  id: number;
  name: string;
  _fanpage_id: string;
  accessToken: string;
  bsnId: number;
}

export interface IFanpageDialogResponse {
  id: number;
  avatar: string;
  name: string;
  _profile_id: string;
  type: string;
  publishedTime: string;
  content: string;
  _post_id: string;
  _fanpage_id: string;
  createdTime: string;
  pageAccessToken: string;
}

export interface IZaloDialogResponse {
  id: number;
  avatar: string;
  name: string;
  userId: string;
  publishedTime: string;
  content: string;
  displayName: string;
  // _post_id: string;
  oaId: string;
  createdTime: string;
  // pageAccessToken: string;
}

export interface IFanpageChatResponse {
  id: number;
  attachment: string;
  attachments: string;
  content: string;
  createdTime: string;
  dialogId: string;
  messageId: string;
  pageAccessToken: string;
  publishedTime: string;
  readUsers: string;
  receiverId: string;
  senderAvatar: string;
  senderId: string;
  senderName: string;
  statusSentFb: number;
  _fanpage_id: string;
  _message_id: string;
}

interface IRepliesProps {
  id: number;
  content: string;
  isHidden: string;
  pageAccessToken: string;
  phone: string;
  profileAvatar: string;
  profileName: string;
  publishedTime: string;
  readUsers: string;
  replies: any;
  statusComment: number;
  _comment_id: string;
  _fanpage_id: string;
  _post_id: string;
  _profile_id: string;
  _reply_comment_id: string;
}

export interface IFanpageCommentResponse {
  id: number;
  content: string;
  isHidden: string;
  pageAccessToken: string;
  phone: string;
  profileAvatar: string;
  profileName: string;
  publishedTime: string;
  readUsers: string;
  statusComment: number;
  _comment_id: string;
  _fanpage_id: string;
  _post_id: string;
  _profile_id: string;
  _reply_comment_id: string;
  replies: IRepliesProps[];
}
