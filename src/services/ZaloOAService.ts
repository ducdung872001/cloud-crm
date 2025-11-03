import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
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
    return fetch(`${urlsApi.zaloOA.connect}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // Lấy ra danh sách các fanpage
  list: () => {
    return fetch(urlsApi.zaloOA.list, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Gỡ fanpage không theo dõi
  delete: (id: string) => {
    return fetch(`${urlsApi.zaloOA.delete}?oaId=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //* Lấy danh sách hội thoại chat
  listZaloFollower: (params: IZaloFollowerFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.zaloOA.listZaloFollower}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //* Danh sách tin nhắn chat từ người dùng tương tác với zalo
  listZaloChat: (params: IZaloChatFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.zaloOA.listZaloChat}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //* Nhắn tin cho người dùng
  sendZaloChat: (body: ISendZaloChatRequest) => {
    return fetch(urlsApi.zaloOA.sendZaloChat, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //* Gửi tin nhắn dạng link ảnh
  linkImageSendZaloChat: (body: ILinkImageSendZaloChatRequest) => {
    return fetch(urlsApi.zaloOA.linkImageSendZaloChat, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //* Gửi tin nhắn đính kèm file
  fileSendZaloChat: (body: IFileSendZaloChatRequest) => {
    return fetch(urlsApi.zaloOA.fileSendZaloChat, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //* Phản hồi lại 1 tin nhắn (trả lời 1 tin nhắn khác)
  answerSendZaloChat: (body: IAnswerSendZaloChatRequest) => {
    return fetch(urlsApi.zaloOA.answerSendZaloChat, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //* Gỡ 1 tin nhắn chat
  deleteZaloChat: (id: number) => {
    return fetch(`${urlsApi.zaloOA.deleteZaloChat}=id${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
