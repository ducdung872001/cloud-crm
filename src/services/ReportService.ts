import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IReportCommonFilterRequest } from "model/report/ReportRequest";

export default {
  revenue: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.report.revenue, params, signal);
  },

  employee: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.report.employee, params, signal);
  },

  product: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.report.product, params, signal);
  },

  cardService: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.report.cardService, params, signal);
  },

  service: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.report.service, params, signal);
  },

  city: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.report.city, params, signal);
  },

  customer: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.report.customer, params, signal);
  },
};
