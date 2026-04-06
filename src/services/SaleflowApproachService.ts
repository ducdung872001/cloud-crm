import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.saleflowApproach.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.saleflowApproach.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.saleflowApproach.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.saleflowApproach.delete}?id=${id}`);
  },
  updateSLA: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.saleflowApproach.updateSLA, body);
  },

  activityList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.saleflowApproach.activityList, params, signal);
  },

  updateActivity: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.saleflowApproach.updateActivity, body);
  },
  deleteActivity: (id: number) => {
    return apiDelete(`${urlsApi.saleflowApproach.deleteActivity}?id=${id}`);
  },

  updateSaleflowSale: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.saleflowApproach.updateSaleflowSale, body);
  },

  detailSaleflowSale: (id: number) => {
    return fetch(`${urlsApi.saleflowApproach.detailSaleflowSale}?approachId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
