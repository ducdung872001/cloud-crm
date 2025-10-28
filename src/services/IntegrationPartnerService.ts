import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IProductFilterRequest, IProductRequest } from "model/product/ProductRequestModel";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.integration.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
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

  logList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.integration.logList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateStatus: (body: any) => {
    return fetch(urlsApi.integration.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
