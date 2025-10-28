import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  totalCurentCustomer: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportCustomer.totalCurentCustomer}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // Chi tiết số KH phát sinh hợp đồng
  totalCurentCustomerDetail: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportCustomer.totalCurentCustomerDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // Chi tiết số hợp đồng đã ký
  totalContractSignerDetail: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportCustomer.totalContractSignerDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // Chi tiết doanh thu còn phải thu trong kì
  revenueNotYetReceivedDetail: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportCustomer.revenueNotYetReceivedDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  totalContract: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportCustomer.totalContract}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  pipeline: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportCustomer.pipeline}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // /contract/dashboard/notInTime/pipeline
  notInTimePipeline: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportCustomer.notInTimePipeline}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  totalRevenue: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportCustomer.totalRevenue}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  externalOrnot: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportCustomer.externalOrnot}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  relationShip: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportCustomer.relationShip}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //   curl --location 'http://localhost:9100/adminapi/customer/dashboard/relationShip?employeeId=-1' \
  // --header 'Accept: application/json' \
};
