import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.common.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.common.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.common.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.common.delete}?id=${id}`);
  },
};
