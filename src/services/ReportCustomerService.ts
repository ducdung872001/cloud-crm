import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  totalCurentCustomer: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportCustomer.totalCurentCustomer, params, signal);
  },
  // Chi tiết số KH phát sinh hợp đồng
  totalCurentCustomerDetail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportCustomer.totalCurentCustomerDetail, params, signal);
  },
  // Chi tiết số hợp đồng đã ký
  totalContractSignerDetail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportCustomer.totalContractSignerDetail, params, signal);
  },
  // Chi tiết doanh thu còn phải thu trong kì
  revenueNotYetReceivedDetail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportCustomer.revenueNotYetReceivedDetail, params, signal);
  },
  totalContract: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportCustomer.totalContract, params, signal);
  },
  pipeline: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportCustomer.pipeline, params, signal);
  },
  // /contract/dashboard/notInTime/pipeline
  notInTimePipeline: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportCustomer.notInTimePipeline, params, signal);
  },
  totalRevenue: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportCustomer.totalRevenue, params, signal);
  },
  externalOrnot: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportCustomer.externalOrnot, params, signal);
  },
  relationShip: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportCustomer.relationShip, params, signal);
  },
  //   curl --location 'http://localhost:9100/adminapi/customer/dashboard/relationShip?employeeId=-1' \
  // --header 'Accept: application/json' \
};
