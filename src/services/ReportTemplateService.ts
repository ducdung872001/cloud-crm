import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IReportTemplateFilterRequest, IReportTemplateRequest } from "model/reportTemplate/ReportTemplateRequestModel";

export default {
  list: (params: IReportTemplateFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportTemplate.list, params, signal);
  },
  update: (body: IReportTemplateRequest) => {
    return apiPost(urlsApi.reportTemplate.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.reportTemplate.delete}?id=${id}`);
  },
};
