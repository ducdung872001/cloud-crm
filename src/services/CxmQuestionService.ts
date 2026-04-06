import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.cxmQuestion.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.cxmQuestion.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.cxmQuestion.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.cxmQuestion.delete}?id=${id}`);
  },
};
