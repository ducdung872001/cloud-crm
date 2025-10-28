import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IInstallApplicationFilterRequest, IInstallApplicationRequest } from "model/installApplication/InstallApplicationRequestModel";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.webhook.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.webhook.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.webhook.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.webhook.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
