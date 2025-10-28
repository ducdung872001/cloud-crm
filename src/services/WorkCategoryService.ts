import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.workCategory.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.workCategory.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateStatus: (body: any) => {
    return fetch(urlsApi.workCategory.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id?: number, code?: string) => {
    if (id) {
      return fetch(`${urlsApi.workCategory.detail}?id=${id}`, {
        method: "GET",
      }).then((res) => res.json());
    } else {
      return fetch(`${urlsApi.workCategory.detail}?code=${code}`, {
        method: "GET",
      }).then((res) => res.json());
    }
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.workCategory.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
