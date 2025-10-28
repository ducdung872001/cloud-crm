import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.productAttribute.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.productAttribute.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.productAttribute.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  listAll: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.productAttribute.listAll}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  checkDuplicated: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.productAttribute.checkDuplicated}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
