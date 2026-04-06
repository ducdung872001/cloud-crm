import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IDepartmentFilterRequest, IDepartmentRequest } from "model/department/DepartmentRequestModel";

export default {
  list: (params?: IDepartmentFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.department.list, params, signal);
  },
  update: (body: IDepartmentRequest) => {
    return apiPost(urlsApi.department.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.department.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.department.delete}?id=${id}`);
  },
  // list_branch: (params?: any, signal?: AbortSignal) => {
  //   return fetch(`${urlsApi.department.list_branch}${(params)}`, {
  //     signal,
  //     method: "POST",
  //   }).then((res) => res.json());
  // },

  list_branch: (body: IDepartmentRequest) => {
    return apiPost(urlsApi.department.list_branch, body);
  },

  // costs
  lstCost: (params?: Record<string, unknown>) => {
    return fetch(`${urlsApi.department.detail}/cost${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  updateCost: (body: Record<string, unknown>) => {
    return apiPost(`${urlsApi.department.update}/cost`, body);
  },

  updateParent: (body: IDepartmentRequest) => {
    return apiPost(urlsApi.department.updateParent, body);
  },
};
