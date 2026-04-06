import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.cxmOption.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.cxmOption.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.cxmOption.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.cxmOption.delete}?id=${id}`);
  },
};
