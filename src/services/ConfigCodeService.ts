import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IConfigCodeFilterRequest, IConfigCodeRequestModel } from "model/configCode/ConfigCodeRequest";

export default {
  list: (params?: IConfigCodeFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.configCode.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IConfigCodeRequestModel) => {
    return fetch(urlsApi.configCode.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.configCode.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.configCode.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
