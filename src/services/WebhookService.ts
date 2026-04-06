import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IInstallApplicationFilterRequest, IInstallApplicationRequest } from "model/installApplication/InstallApplicationRequestModel";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.webhook.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.webhook.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.webhook.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.webhook.delete}?id=${id}`);
  },
};
