import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { ICategoryServiceFilterRequest, ICategoryServiceRequestModel } from "model/categoryService/CategoryServiceRequestModel";


export default {
  list: (params?: ICategoryServiceFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.categoryService.list, params, signal);
  },
  update: (body: ICategoryServiceRequestModel) => {
    return apiPost(urlsApi.categoryService.update, body);
  },
  updatePositions: (items: { id: number; position: number }[]) => {
    return apiPost(urlsApi.categoryService.updatePositions, items);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.categoryService.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.categoryService.delete}?id=${id}`);
  },
  mediaGet: (categoryId: number) => {
    return fetch(`${urlsApi.product.categoryMediaGet}?categoryId=${categoryId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  mediaDelete: (categoryId: number) => {
    return apiDelete(`${urlsApi.product.categoryMediaDelete}?categoryId=${categoryId}`);
  },
  mediaUpload: (categoryId: number, file: File) => {
    const formData = new FormData();
    formData.append("categoryId", String(categoryId));
    formData.append("file", file);
    return fetch(`${urlsApi.product.categoryMediaUpload}?categoryId=${categoryId}`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  },
};