import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ITemplateEmailFilterRequest, ITemplateEmailRequestModel } from "model/templateEmail/TemplateEmailRequestModel";

export default {
  list: (params?: ITemplateEmailFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.templateEmail.list, params, signal);
  },
  update: (body: ITemplateEmailRequestModel) => {
    return apiPost(urlsApi.templateEmail.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.templateEmail.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.templateEmail.delete}?id=${id}`);
  },
};
