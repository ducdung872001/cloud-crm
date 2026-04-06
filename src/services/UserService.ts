import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IChangePasswordRequest, IUserRequest, ISelectUsersFilterRequest } from "model/user/UserRequestModel";

export default {
  //Đánh dấu hết hạn token bên phía server
  // logout: () => {
  //   return fetch(urlsApi.logout, { method: "POST" }).then((res) => res.json());
  // },
  profile: (token: string) => {
    return fetch(`${urlsApi.user.profile}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },
  create: (body: IUserRequest) => {
    return apiPost(urlsApi.user.create, body);
  },
  update: (body: IUserRequest) => {
    return apiPost(urlsApi.user.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.user.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  selectUsers: (params?: ISelectUsersFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.user.selectUsers, params, signal);
  },
  //Admin thực hiện
  resetPass: (body: IUserRequest) => {
    return apiPost(urlsApi.user.resetPass, body);
  },
  changePass: (body: IChangePasswordRequest) => {
    return apiPost(urlsApi.user.changePass, body);
  },
  // thay đổi thông tin cá nhân
  basicInfo: (body) => {
    return apiPost(urlsApi.user.basicInfo, body);
  },
  checkLogin: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.user.checkLogin, params);
  },
  detailTimeLogin: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.user.detailTimeLogin, params);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.user.delete}?id=${id}`);
  },
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.user.list, params, signal);
  },
  // lưu FCM thông báo
  fcmDevice: (body) => {
    return apiPost(urlsApi.user.fcmDevice, body);
  },
};
