import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customerView.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: Record<string, unknown>) => {
    return fetch(urlsApi.customerView.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.customerView.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
