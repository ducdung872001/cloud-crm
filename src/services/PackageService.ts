import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  lst: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.package.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.package.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.package.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.package.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  updateStatus: (body) => {
    return fetch(`${urlsApi.package.updateStatus}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  addOrgApp: (body) => {
    return fetch(urlsApi.package.addOrgApp, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateBill: (body) => {
    return fetch(urlsApi.package.updateBill, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  calcPrice: (body) => {
    return fetch(urlsApi.package.calcPrice, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  extend: (body) => {
    return fetch(urlsApi.package.extend, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  upgrade: (body) => {
    return fetch(urlsApi.package.upgrade, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
