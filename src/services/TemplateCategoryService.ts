import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ITemplateCategoryFilterRequest, ITemplateCategoryRequestModel } from "model/templateCategory/TemplateCategoryRequest";

export default {
  list: (params?: ITemplateCategoryFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.templateCategory.list, params, signal);
  },
  update: (body: ITemplateCategoryRequestModel) => {
    return apiPost(urlsApi.templateCategory.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.templateCategory.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.templateCategory.delete}?id=${id}`);
  },
};
