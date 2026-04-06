import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { IEmployeeFilterRequest, IEmployeeRequest, ILinkEmployeeUserRequest } from "model/employee/EmployeeRequestModel";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: IEmployeeFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.employee.list, params, signal);
  },
  update: (body: IEmployeeRequest) => {
    return apiPost(urlsApi.employee.update, body);
  },
  updateRole: (body: IEmployeeRequest) => {
    return apiPost(urlsApi.employee.updateRole, body);
  },
  deleteRole: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiDelete(`${urlsApi.employee.deleteRole}${convertParamsToString(params)}`);
  },
  getListRoleEmployee: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.employee.getListRoleEmployee, params, signal);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.employee.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.employee.delete}?id=${id}`);
  },
  linkEmployeeUser: (body: ILinkEmployeeUserRequest) => {
    return apiPost(urlsApi.employee.linkEmployeeUser, body);
  },
  //Khởi tạo thông tin tài khoản owner thẩm mỹ viện, lần đầu đăng nhập vào Reborn CRM
  init: () => {
    return fetch(`${urlsApi.employee.init}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  info: () => {
    return apiGet(urlsApi.employee.info);
  },
  listExTip: (params?: IEmployeeFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.employee.listExTip, params, signal);
  },
  generateRandomPass: (signal?: AbortSignal) => {
    return fetch(`${urlsApi.employee.generateRandomPass}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  list_department: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.employee.list_department, params, signal);
  },

  updateToken: (body: IEmployeeRequest) => {
    return apiPost(urlsApi.employee.updateToken, body);
  },
  checkEmailConnection: () => {
    return apiGet(urlsApi.employee.checkEmailConnection);
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
