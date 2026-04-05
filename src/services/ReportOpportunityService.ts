import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  totalOpportunity: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.totalOpportunity}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // //Chi tiết tổng số cơ hội
  totalOpportunityDetail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.totalOpportunityDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //Chi tiết doanh thu dự kiến
  expectedRevenueDetail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.expectedRevenueDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //Chi tiết doanh thu ký hợp đồng
  contractRevenueDetail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.contractRevenueDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  opportunityByDate: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.opportunityByDate}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  expectedRevenue: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.expectedRevenue}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  totalByApproach: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.totalByApproach}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
