import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IKpiTemplateFilterRequest, IKpiTemplateRequest } from "model/kpiTemplate/KpiTemplateRequestModel";

export default {
  list: (params: IKpiTemplateFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpiTemplate.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IKpiTemplateRequest) => {
    return fetch(urlsApi.kpiTemplate.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.kpiTemplate.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
