import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IDeclareEmailFilterRequest, IDeclareEmailRequestModel } from "model/declareEmail/DeclareEmailRequestModel";

export default {
  list: (params?: IDeclareEmailFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.emailConfig.list, params, signal);
  },
  update: (body: IDeclareEmailRequestModel) => {
    return apiPost(urlsApi.emailConfig.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.emailConfig.delete}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.emailConfig.delete}?id=${id}`);
  },

  checkEmail: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.emailConfig.checkEmail, body);
  },
};
