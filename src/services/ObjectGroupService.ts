import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.objectGroup.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.objectGroup.update, body);
  },
  updateConfig: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.objectGroup.updateConfig, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.objectGroup.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  detailByType: (type: string) => {
    return fetch(`${urlsApi.objectGroup.detail}?type=${type}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.objectGroup.delete}?id=${id}`);
  },
};
