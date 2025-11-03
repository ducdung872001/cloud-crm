import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICategoryFilterRequest, ICategoryRequest } from "model/category/CategoryResquestModel";

export default {
  list: (params?: ICategoryFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.category.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICategoryRequest) => {
    return fetch(urlsApi.category.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.category.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.category.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
