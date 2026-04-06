import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.procurement.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.procurement.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.procurement.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.procurement.delete}?id=${id}`);
  },
};
