import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.projectCatalog.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.projectCatalog.update, body);
  },
  updateStatus: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.projectCatalog.updateStatus, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.projectCatalog.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.projectCatalog.delete}?id=${id}`);
  },
};
