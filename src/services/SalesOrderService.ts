import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.salesOrder.list, params, signal);
  },
  get: (id: number, signal?: AbortSignal) => {
    return apiGet(urlsApi.salesOrder.get, { id }, signal);
  },
  create: (data: Record<string, unknown>) => {
    return apiPost(urlsApi.salesOrder.create, data);
  },
  update: (data: Record<string, unknown>, id?: number) => {
    return apiPost(
      id !== undefined ? `${urlsApi.salesOrder.update}?id=${id}` : urlsApi.salesOrder.update,
      data,
    );
  },
  delete: (id: number) => {
    return apiDelete(urlsApi.salesOrder.delete, { id });
  },
  revenueSummary: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.salesOrder.revenueSummary, params, signal);
  },
};
