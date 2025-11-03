import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.saleflowApproach.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.saleflowApproach.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.saleflowApproach.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.saleflowApproach.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  updateSLA: (body: any) => {
    return fetch(urlsApi.saleflowApproach.updateSLA, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  activityList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.saleflowApproach.activityList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateActivity: (body: any) => {
    return fetch(urlsApi.saleflowApproach.updateActivity, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteActivity: (id: number) => {
    return fetch(`${urlsApi.saleflowApproach.deleteActivity}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  updateSaleflowSale: (body: any) => {
    return fetch(urlsApi.saleflowApproach.updateSaleflowSale, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detailSaleflowSale: (id: number) => {
    return fetch(`${urlsApi.saleflowApproach.detailSaleflowSale}?approachId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
