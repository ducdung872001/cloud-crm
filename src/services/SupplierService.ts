import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.supplier.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.supplier.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateActive: (body: any) => {
    return fetch(urlsApi.supplier.updateActive, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.supplier.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.supplier.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // API người liên hệ
  listContact: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.supplier.listContact}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  deleteContact: (id: number) => {
    return fetch(`${urlsApi.supplier.deleteContact}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  detailContact: (id: number) => {
    return fetch(`${urlsApi.supplier.detailContact}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
