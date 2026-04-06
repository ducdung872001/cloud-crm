import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.customerView.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.customerView.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.customerView.delete}?id=${id}`);
  },
};
