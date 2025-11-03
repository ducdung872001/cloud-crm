import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ITemplateEmailFilterRequest, ITemplateEmailRequestModel } from "model/templateEmail/TemplateEmailRequestModel";

export default {
  list: (params?: ITemplateEmailFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.templateEmail.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ITemplateEmailRequestModel) => {
    return fetch(urlsApi.templateEmail.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.templateEmail.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.templateEmail.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
