import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IInstallApplicationFilterRequest, IInstallApplicationRequest } from "model/installApplication/InstallApplicationRequestModel";

export default {
  list: (params?: IInstallApplicationFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.installApp.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IInstallApplicationRequest) => {
    return fetch(urlsApi.installApp.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.installApp.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.installApp.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  takeKey: () => {
    return fetch(`${urlsApi.installApp.takeKey}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
