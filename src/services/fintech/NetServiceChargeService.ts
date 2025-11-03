import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.netServiceCharge.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  get: (id: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.netServiceCharge.get}?id=${id}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.netServiceCharge.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.netServiceCharge.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
