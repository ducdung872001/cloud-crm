import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.operationProject.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.operationProject.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.operationProject.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.operationProject.delete}?id=${id}`);
  },
};
