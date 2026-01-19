import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
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
    return fetch(urlsApi.user.create, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  update: (body: IUserRequest) => {
    return fetch(urlsApi.user.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.user.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  selectUsers: (params?: ISelectUsersFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.user.selectUsers}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //Admin thực hiện
  resetPass: (body: IUserRequest) => {
    return fetch(urlsApi.user.resetPass, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  changePass: (body: IChangePasswordRequest) => {
    return fetch(urlsApi.user.changePass, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // thay đổi thông tin cá nhân
  basicInfo: (body) => {
    return fetch(urlsApi.user.basicInfo, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  checkLogin: (params: any) => {
    return fetch(`${urlsApi.user.checkLogin}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  detailTimeLogin: (params: any) => {
    return fetch(`${urlsApi.user.detailTimeLogin}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.user.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.user.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // lưu FCM thông báo
  fcmDevice: (body) => {
    return fetch(urlsApi.user.fcmDevice, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
