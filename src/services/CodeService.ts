import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { ICategoryServiceFilterRequest, ICategoryServiceRequestModel } from "model/categoryService/CategoryServiceRequestModel";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.codeSequence.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.codeSequence.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.codeSequence.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  detailEntity: (entity: string) => {
    return fetch(`${urlsApi.codeSequence.detailEntity}?entityName=${entity}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.codeSequence.delete}?id=${id}`);
  },
};
