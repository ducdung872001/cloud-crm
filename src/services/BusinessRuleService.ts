import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessRule.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessRule.update, body);
  },
  updateActive: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessRule.updateActive, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.businessRule.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.businessRule.delete}?id=${id}`);
  },
};
