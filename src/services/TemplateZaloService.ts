import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ITemplateZaloFilterRequest, ITemplateZaloRequestModel } from "model/templateZalo/TemplateZaloRequestModel";
export default {
  list: (params?: ITemplateZaloFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.templateZalo.list, params, signal);
  },
  update: (body: ITemplateZaloRequestModel) => {
    return apiPost(urlsApi.templateZalo.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.templateZalo.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.templateZalo.delete}?id=${id}`);
  },
};
