import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.saleflow.list, params, signal);
  },
  
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.saleflow.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.saleflow.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.saleflow.delete}?id=${id}`);
  },

};
