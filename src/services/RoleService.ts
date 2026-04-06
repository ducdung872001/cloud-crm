import { apiDelete, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.role.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "true", // Header tùy chỉnh (nếu có)
      },
    }).then((res) => res.json());
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.role.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.role.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.role.delete}?id=${id}`);
  },
  // list_branch: (params?: any, signal?: AbortSignal) => {
  //   return fetch(`${urlsApi.role.list_branch}${(params)}`, {
  //     signal,
  //     method: "POST",
  //   }).then((res) => res.json());
  // },

  list_branch: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.role.list_branch, body);
  },

  // costs
  lstCost: (params?: Record<string, unknown>) => {
    return fetch(`${urlsApi.role.detail}/cost${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  updateCost: (body: Record<string, unknown>) => {
    return apiPost(`${urlsApi.role.update}/cost`, body);
  },

  updateParent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.role.updateParent, body);
  },
};
