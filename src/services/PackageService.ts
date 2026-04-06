import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  lst: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.package.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.package.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.package.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.package.delete}?id=${id}`);
  },
  updateStatus: (body) => {
    return apiPost(`${urlsApi.package.updateStatus}`, body);
  },
  addOrgApp: (body) => {
    return apiPost(urlsApi.package.addOrgApp, body);
  },
  updateBill: (body) => {
    return apiPost(urlsApi.package.updateBill, body);
  },
  calcPrice: (body) => {
    return apiPost(urlsApi.package.calcPrice, body);
  },
  extend: (body) => {
    return apiPost(urlsApi.package.extend, body);
  },
  upgrade: (body) => {
    return apiPost(urlsApi.package.upgrade, body);
  },
};
