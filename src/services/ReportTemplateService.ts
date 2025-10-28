import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IReportTemplateFilterRequest, IReportTemplateRequest } from "model/reportTemplate/ReportTemplateRequestModel";

export default {
  list: (params: IReportTemplateFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportTemplate.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IReportTemplateRequest) => {
    return fetch(urlsApi.reportTemplate.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.reportTemplate.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
