import { urlsApi } from "configs/urls";
import { update } from "lodash";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.order.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.order.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  create: (data: any) => {
    return fetch(`${urlsApi.order.update}`, {
      method: "POST",
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },
  update: (data: any, id: number) => {
    return fetch(`${urlsApi.order.update}?id=${id}`, {
      method: "POST",
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },
  delete: (id: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.order.delete}/${id}`, {
      signal,
      method: "DELETE",
    }).then((res) => res.json());
  },
};
