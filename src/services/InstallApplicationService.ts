import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IInstallApplicationFilterRequest, IInstallApplicationRequest } from "model/installApplication/InstallApplicationRequestModel";

export default {
  list: (params?: IInstallApplicationFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.installApp.list, params, signal);
  },
  update: (body: IInstallApplicationRequest) => {
    return apiPost(urlsApi.installApp.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.installApp.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.installApp.delete}?id=${id}`);
  },
  takeKey: () => {
    return fetch(`${urlsApi.installApp.takeKey}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
