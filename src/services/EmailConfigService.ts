import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IDeclareEmailFilterRequest, IDeclareEmailRequestModel } from "model/declareEmail/DeclareEmailRequestModel";

export default {
  list: (params?: IDeclareEmailFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.emailConfig.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IDeclareEmailRequestModel) => {
    return fetch(urlsApi.emailConfig.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.emailConfig.delete}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.emailConfig.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  checkEmail: (body: any) => {
    return fetch(urlsApi.emailConfig.checkEmail, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
