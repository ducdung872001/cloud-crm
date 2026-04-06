import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import {
  IZaloOAConnectFilterRequest,
  IZaloFollowerFilterRequest,
  IZaloChatFilterRequest,
  ISendZaloChatRequest,
  ILinkImageSendZaloChatRequest,
  IFileSendZaloChatRequest,
  IAnswerSendZaloChatRequest,
} from "model/zaloOA/ZaloOARequest";

export default {
  // Thêm mới zalo vào danh sách hoặc cập nhật thông tin zalo
  connect: (params: IZaloOAConnectFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.zaloOA.connect, params, signal);
  },
  // Lấy ra danh sách các fanpage
  list: () => {
    return apiGet(urlsApi.zaloOA.list);
  },
  // Gỡ fanpage không theo dõi
  delete: (id: string) => {
    return apiDelete(`${urlsApi.zaloOA.delete}?oaId=${id}`);
  },
  //* Lấy danh sách hội thoại chat
  listZaloFollower: (params: IZaloFollowerFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.zaloOA.listZaloFollower, params, signal);
  },
  //* Danh sách tin nhắn chat từ người dùng tương tác với zalo
  listZaloChat: (params: IZaloChatFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.zaloOA.listZaloChat, params, signal);
  },
  //* Nhắn tin cho người dùng
  sendZaloChat: (body: ISendZaloChatRequest) => {
    return apiPost(urlsApi.zaloOA.sendZaloChat, body);
  },
  //* Gửi tin nhắn dạng link ảnh
  linkImageSendZaloChat: (body: ILinkImageSendZaloChatRequest) => {
    return apiPost(urlsApi.zaloOA.linkImageSendZaloChat, body);
  },
  //* Gửi tin nhắn đính kèm file
  fileSendZaloChat: (body: IFileSendZaloChatRequest) => {
    return apiPost(urlsApi.zaloOA.fileSendZaloChat, body);
  },
  //* Phản hồi lại 1 tin nhắn (trả lời 1 tin nhắn khác)
  answerSendZaloChat: (body: IAnswerSendZaloChatRequest) => {
    return apiPost(urlsApi.zaloOA.answerSendZaloChat, body);
  },
  //* Gỡ 1 tin nhắn chat
  deleteZaloChat: (id: number) => {
    return apiDelete(`${urlsApi.zaloOA.deleteZaloChat}=id${id}`);
  },
};
