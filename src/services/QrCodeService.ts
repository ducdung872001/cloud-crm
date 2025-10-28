import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  lst: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.qrCode.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body) => {
    return fetch(urlsApi.qrCode.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.qrCode.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.qrCode.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
