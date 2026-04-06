import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessCategory.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessCategory.update, body);
  },
  updateActive: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessCategory.updateActive, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.businessCategory.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.businessCategory.delete}?id=${id}`);
  },
};
