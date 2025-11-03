import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IWarrantyCategoryFilterRequest, IWarrantyCategoryRequest } from "model/warrantyCategory/WarrantyCategoryRequestModel";

export default {
  list: (params?: IWarrantyCategoryFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warrantyCategory.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IWarrantyCategoryRequest) => {
    return fetch(urlsApi.warrantyCategory.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.warrantyCategory.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.warrantyCategory.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
