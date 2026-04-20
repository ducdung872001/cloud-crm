import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.spaceCustomer.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.spaceCustomer.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.spaceCustomer.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.spaceCustomer.delete}?id=${id}`);
  },
};
