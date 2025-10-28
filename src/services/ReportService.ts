import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IReportCommonFilterRequest } from "model/report/ReportRequest";

export default {
  revenue: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.report.revenue}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  employee: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.report.employee}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  product: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.report.product}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  cardService: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.report.cardService}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  service: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.report.service}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  city: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.report.city}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  customer: (params?: IReportCommonFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.report.customer}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
