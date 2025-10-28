import { urlsApi } from "configs/urls";
import { IEmployeeFilterRequest, IEmployeeRequest, ILinkEmployeeUserRequest } from "model/employee/EmployeeRequestModel";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: IEmployeeFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.employee.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IEmployeeRequest) => {
    return fetch(urlsApi.employee.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateRole: (body: IEmployeeRequest) => {
    return fetch(urlsApi.employee.updateRole, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteRole: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.employee.deleteRole}${convertParamsToString(params)}`, {
      signal,
      method: "DELETE",
    }).then((res) => res.json());
  },
  getListRoleEmployee: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.employee.getListRoleEmployee}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.employee.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.employee.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  linkEmployeeUser: (body: ILinkEmployeeUserRequest) => {
    return fetch(urlsApi.employee.linkEmployeeUser, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //Khởi tạo thông tin tài khoản owner thẩm mỹ viện, lần đầu đăng nhập vào Reborn CRM
  init: () => {
    return fetch(`${urlsApi.employee.init}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  info: () => {
    return fetch(urlsApi.employee.info, {
      method: "GET",
    }).then((res) => res.json());
  },
  listExTip: (params?: IEmployeeFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.employee.listExTip}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  generateRandomPass: (signal?: AbortSignal) => {
    return fetch(`${urlsApi.employee.generateRandomPass}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  list_department: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.employee.list_department}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateToken: (body: IEmployeeRequest) => {
    return fetch(urlsApi.employee.updateToken, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  checkEmailConnection: () => {
    return fetch(urlsApi.employee.checkEmailConnection, {
      method: "GET",
    }).then((res) => res.json());
  },
  disconnectEmail: () => {
    return fetch(urlsApi.employee.disconnectEmail, {
      method: "POST",
    }).then((res) => res.json());
  },
  takeRoles: (token: string) => {
    return fetch(`${urlsApi.employee.takeRoles}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },
};
