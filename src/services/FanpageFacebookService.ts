import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

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
    return apiGet(urlsApi.fanpageFacebook.connect, params);
  },
  list: () => {
    return apiGet(urlsApi.fanpageFacebook.list);
  },
  // Thêm mới fanpage vào danh sách hoặc cập nhật thông tin fanpage
  update: (body: IFanpageFacebookRequest) => {
    return apiPost(urlsApi.fanpageFacebook.update, body);
  },
  // Gỡ fanpage không theo dõi
  delete: (id: string) => {
    return apiDelete(`${urlsApi.fanpageFacebook.delete}?fanpageId=${id}`);
  },
  //* Lấy danh sách fanpage đã được kết nối
  listFanpage: () => {
    return apiGet(urlsApi.fanpageFacebook.listFanpage);
  },
  //* Lấy danh sách hội thoại chat
  listFanpageDialog: (params?: IFanpageDialogFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.fanpageFacebook.listFanpageDialog, params, signal);
  },
  //* Danh sách tin nhắn chat từ fanpage
  listFanpageChat: (params?: IFanpageChatFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.fanpageFacebook.listFanpageChat, params, signal);
  },
  //* Phản hồi (nhắn tin phản hồi người chat facebook)
  replyFanpageChat: (body: IReplyFanpageChatRequest) => {
    return apiPost(urlsApi.fanpageFacebook.replyFanpageChat, body);
  },
  //* Danh sách bình luận từ fanpage
  listFanpageComment: (params?: IFanpageCommentFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.fanpageFacebook.listFanpageComment, params, signal);
  },
  //* Phản hồi 1 bình luận từ 1 bình luận của khách hàng hoặc sửa lại bình luận đã phản hồi
  replyFanpageComment: (body: IReplyFanpageCommentRequest) => {
    return apiPost(urlsApi.fanpageFacebook.replyFanpageComment, body);
  },
  //* Gỡ 1 bình luận đã đăng
  deleteFanpageComment: (id: number) => {
    return apiDelete(`${urlsApi.fanpageFacebook.deleteFanpageComment}?id=${id}`);
  },
  //* Ẩn 1 bình luận trên fanpage
  hiddenFanpageComment: (id: number) => {
    return apiDelete(`${urlsApi.fanpageFacebook.hiddenFanpageComment}?id=${id}`);
  },
  //* Lấy thông tin bài đã đăng
  fanpagePost: (postId: string) => {
    return fetch(`${urlsApi.fanpageFacebook.fanpagePost}=postId${postId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //* Gửi file đính kèm trong messenger
  fanpageChatSendAttachment: (body: IFanpageChatSendAttachmentRequest) => {
    return apiPost(urlsApi.fanpageFacebook.fanpageChatSendAttachment, body);
  },
};
