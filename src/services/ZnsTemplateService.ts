import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IZnsTemplateFilterRequest, IZnsTemplateRequest } from "model/znsTemplate/ZnsTemplateRequestModel";

export default {
  list: (params?: IZnsTemplateFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.znsTemplate.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateSync: (oaId: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.znsTemplate.updateSync}${convertParamsToString({oaId: oaId})}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  }, 
  detail: (id: number) => {
    return fetch(`${urlsApi.znsTemplate.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  templateDetail: (oaId: string) => {
    return fetch(`${urlsApi.znsTemplate.templateDetail}?oaId=${oaId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.znsTemplate.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
