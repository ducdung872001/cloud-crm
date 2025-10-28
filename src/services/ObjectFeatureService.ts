import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?, signal?: AbortSignal) => {
    return fetch(`${urlsApi.objectFeature.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body) => {
    return fetch(urlsApi.objectFeature.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.objectFeature.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.objectFeature.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
