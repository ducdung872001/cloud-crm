import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessCategory.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: Record<string, unknown>) => {
    return fetch(urlsApi.businessCategory.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateActive: (body: Record<string, unknown>) => {
    return fetch(urlsApi.businessCategory.updateActive, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.businessCategory.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.businessCategory.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
