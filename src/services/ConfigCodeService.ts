import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IConfigCodeFilterRequest, IConfigCodeRequestModel } from "model/configCode/ConfigCodeRequest";

export default {
  list: (params?: IConfigCodeFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.configCode.list, params, signal);
  },
  update: (body: IConfigCodeRequestModel) => {
    return apiPost(urlsApi.configCode.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.configCode.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.configCode.delete}?id=${id}`);
  },
};
