import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IFanpageFacebookRequest,
  IFanpageDialogFilterRequest,
  IFanpageChatFilterRequest,
  IReplyFanpageChatRequest,
  IFanpageCommentFilterRequest,
  IReplyFanpageCommentRequest,
  IFanpageChatSendAttachmentRequest,
} from "model/fanpageFacebook/FanpageFacebookRequestModel";

export default {
  // Thêm mới fanpage vào danh sách hoặc cập nhật thông tin fanpage
  connect: (params: IFanpageFacebookRequest) => {
    return fetch(`${urlsApi.fanpageFacebook.connect}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  list: () => {
    return fetch(urlsApi.fanpageFacebook.list, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Thêm mới fanpage vào danh sách hoặc cập nhật thông tin fanpage
  update: (body: IFanpageFacebookRequest) => {
    return fetch(urlsApi.fanpageFacebook.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // Gỡ fanpage không theo dõi
  delete: (id: string) => {
    return fetch(`${urlsApi.fanpageFacebook.delete}?fanpageId=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //* Lấy danh sách fanpage đã được kết nối
  listFanpage: () => {
    return fetch(urlsApi.fanpageFacebook.listFanpage, {
      method: "GET",
    }).then((res) => res.json());
  },
  //* Lấy danh sách hội thoại chat
  listFanpageDialog: (params?: IFanpageDialogFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.fanpageFacebook.listFanpageDialog}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //* Danh sách tin nhắn chat từ fanpage
  listFanpageChat: (params?: IFanpageChatFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.fanpageFacebook.listFanpageChat}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //* Phản hồi (nhắn tin phản hồi người chat facebook)
  replyFanpageChat: (body: IReplyFanpageChatRequest) => {
    return fetch(urlsApi.fanpageFacebook.replyFanpageChat, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //* Danh sách bình luận từ fanpage
  listFanpageComment: (params?: IFanpageCommentFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.fanpageFacebook.listFanpageComment}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //* Phản hồi 1 bình luận từ 1 bình luận của khách hàng hoặc sửa lại bình luận đã phản hồi
  replyFanpageComment: (body: IReplyFanpageCommentRequest) => {
    return fetch(urlsApi.fanpageFacebook.replyFanpageComment, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //* Gỡ 1 bình luận đã đăng
  deleteFanpageComment: (id: number) => {
    return fetch(`${urlsApi.fanpageFacebook.deleteFanpageComment}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //* Ẩn 1 bình luận trên fanpage
  hiddenFanpageComment: (id: number) => {
    return fetch(`${urlsApi.fanpageFacebook.hiddenFanpageComment}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //* Lấy thông tin bài đã đăng
  fanpagePost: (postId: string) => {
    return fetch(`${urlsApi.fanpageFacebook.fanpagePost}=postId${postId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //* Gửi file đính kèm trong messenger
  fanpageChatSendAttachment: (body: IFanpageChatSendAttachmentRequest) => {
    return fetch(urlsApi.fanpageFacebook.fanpageChatSendAttachment, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
