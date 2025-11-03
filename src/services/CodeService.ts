import { urlsApi } from "configs/urls";
import { ICategoryServiceFilterRequest, ICategoryServiceRequestModel } from "model/categoryService/CategoryServiceRequestModel";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.codeSequence.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.codeSequence.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
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
    return fetch(`${urlsApi.codeSequence.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
