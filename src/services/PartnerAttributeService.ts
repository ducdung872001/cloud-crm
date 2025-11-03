import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.partnerAttribute.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.partnerAttribute.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.partnerAttribute.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  listAll: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.partnerAttribute.listAll}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  checkDuplicated: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.partnerAttribute.checkDuplicated}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
