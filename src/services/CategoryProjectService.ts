import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { ICategoryServiceFilterRequest, ICategoryServiceRequestModel } from "model/categoryService/CategoryServiceRequestModel";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.categoryProject.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.categoryProject.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.categoryProject.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.categoryProject.delete}?id=${id}`);
  },
};
