import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractCategory.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractCategory.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contractCategory.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.contractCategory.delete}?id=${id}`);
  },
};
