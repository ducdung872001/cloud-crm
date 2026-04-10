import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import update from "lodash/update";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.order.list, params, signal);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.order.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  create: (data: Record<string, unknown>) => {
    return apiPost(`${urlsApi.order.update}`, data);
  },
  update: (data: Record<string, unknown>, id: number) => {
    return apiPost(`${urlsApi.order.update}?id=${id}`, data);
  },
  delete: (id: number, signal?: AbortSignal) => {
    return apiDelete(`${urlsApi.order.delete}/${id}`);
  },
};
