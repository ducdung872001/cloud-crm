import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.productAttribute.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.productAttribute.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.productAttribute.delete}?id=${id}`);
  },
  listAll: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.productAttribute.listAll, params, signal);
  },
  checkDuplicated: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.productAttribute.checkDuplicated, params, signal);
  },
};
