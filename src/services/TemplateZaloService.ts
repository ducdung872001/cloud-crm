import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ITemplateZaloFilterRequest, ITemplateZaloRequestModel } from "model/templateZalo/TemplateZaloRequestModel";
export default {
  list: (params?: ITemplateZaloFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.templateZalo.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ITemplateZaloRequestModel) => {
    return fetch(urlsApi.templateZalo.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.templateZalo.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.templateZalo.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
