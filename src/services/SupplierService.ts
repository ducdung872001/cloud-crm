import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.supplier.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.supplier.update, body);
  },
  updateActive: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.supplier.updateActive, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.supplier.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.supplier.delete}?id=${id}`);
  },

  // API người liên hệ
  listContact: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.supplier.listContact, params, signal);
  },
  deleteContact: (id: number) => {
    return apiDelete(`${urlsApi.supplier.deleteContact}?id=${id}`);
  },
  detailContact: (id: number) => {
    return fetch(`${urlsApi.supplier.detailContact}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
