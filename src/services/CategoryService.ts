import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ICategoryFilterRequest, ICategoryRequest } from "model/category/CategoryResquestModel";

export default {
  list: (params?: ICategoryFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.category.list, params, signal);
  },
  update: (body: ICategoryRequest) => {
    return apiPost(urlsApi.category.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.category.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.category.delete}?id=${id}`);
  },
};
