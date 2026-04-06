import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.serviceAttribute.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.serviceAttribute.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.serviceAttribute.delete}?id=${id}`);
  },
  listAll: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.serviceAttribute.listAll, params, signal);
  },
  checkDuplicated: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.serviceAttribute.checkDuplicated, params, signal);
  },
};
