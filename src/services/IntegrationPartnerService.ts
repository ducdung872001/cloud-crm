import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IProductFilterRequest, IProductRequest } from "model/product/ProductRequestModel";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.integration.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.integration.update, body);
  },

  delete: (id: number) => {
    return apiDelete(`${urlsApi.integration.delete}?id=${id}`);
  },

  logList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.integration.logList, params, signal);
  },

  updateStatus: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.integration.updateStatus, body);
  },
};
