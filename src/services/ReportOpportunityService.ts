import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  totalOpportunity: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.totalOpportunity}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // //Chi tiết tổng số cơ hội
  totalOpportunityDetail: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.totalOpportunityDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //Chi tiết doanh thu dự kiến
  expectedRevenueDetail: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.expectedRevenueDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //Chi tiết doanh thu ký hợp đồng
  contractRevenueDetail: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.contractRevenueDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  opportunityByDate: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.opportunityByDate}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  expectedRevenue: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.expectedRevenue}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  totalByApproach: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportOpportunity.totalByApproach}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
