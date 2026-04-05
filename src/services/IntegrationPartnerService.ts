import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IProductFilterRequest, IProductRequest } from "model/product/ProductRequestModel";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.integration.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: Record<string, unknown>) => {
    return fetch(urlsApi.integration.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  delete: (id: number) => {
    return fetch(`${urlsApi.integration.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  logList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.integration.logList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateStatus: (body: Record<string, unknown>) => {
    return fetch(urlsApi.integration.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
