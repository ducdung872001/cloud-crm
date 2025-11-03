import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IDepartmentFilterRequest, IDepartmentRequest } from "model/department/DepartmentRequestModel";

export default {
  list: (params?: IDepartmentFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.department.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IDepartmentRequest) => {
    return fetch(urlsApi.department.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.department.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.department.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // list_branch: (params?: any, signal?: AbortSignal) => {
  //   return fetch(`${urlsApi.department.list_branch}${(params)}`, {
  //     signal,
  //     method: "POST",
  //   }).then((res) => res.json());
  // },

  list_branch: (body: IDepartmentRequest) => {
    return fetch(urlsApi.department.list_branch, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // costs
  lstCost: (params?: any) => {
    return fetch(`${urlsApi.department.detail}/cost${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  updateCost: (body: any) => {
    return fetch(`${urlsApi.department.update}/cost`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  updateParent: (body: IDepartmentRequest) => {
    return fetch(urlsApi.department.updateParent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
