import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IWarrantyCategoryFilterRequest, IWarrantyCategoryRequest } from "model/warrantyCategory/WarrantyCategoryRequestModel";

export default {
  list: (params?: IWarrantyCategoryFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.warrantyCategory.list, params, signal);
  },
  update: (body: IWarrantyCategoryRequest) => {
    return apiPost(urlsApi.warrantyCategory.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.warrantyCategory.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.warrantyCategory.delete}?id=${id}`);
  },
};
