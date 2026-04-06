import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.workCategory.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.workCategory.update, body);
  },
  updateStatus: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.workCategory.updateStatus, body);
  },
  detail: (id?: number, code?: string) => {
    if (id) {
      return fetch(`${urlsApi.workCategory.detail}?id=${id}`, {
        method: "GET",
      }).then((res) => res.json());
    } else {
      return fetch(`${urlsApi.workCategory.detail}?code=${code}`, {
        method: "GET",
      }).then((res) => res.json());
    }
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.workCategory.delete}?id=${id}`);
  },
};
