import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.partnerAttribute.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.partnerAttribute.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.partnerAttribute.delete}?id=${id}`);
  },

  listAll: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.partnerAttribute.listAll, params, signal);
  },

  checkDuplicated: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.partnerAttribute.checkDuplicated, params, signal);
  },
};
