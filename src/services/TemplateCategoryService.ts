import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ITemplateCategoryFilterRequest, ITemplateCategoryRequestModel } from "model/templateCategory/TemplateCategoryRequest";

export default {
  list: (params?: ITemplateCategoryFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.templateCategory.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ITemplateCategoryRequestModel) => {
    return fetch(urlsApi.templateCategory.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.templateCategory.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.templateCategory.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
