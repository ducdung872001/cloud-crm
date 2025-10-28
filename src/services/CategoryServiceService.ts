import { urlsApi } from "configs/urls";
import { ICategoryServiceFilterRequest, ICategoryServiceRequestModel } from "model/categoryService/CategoryServiceRequestModel";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: ICategoryServiceFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.categoryService.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICategoryServiceRequestModel) => {
    return fetch(urlsApi.categoryService.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.categoryService.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.categoryService.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
