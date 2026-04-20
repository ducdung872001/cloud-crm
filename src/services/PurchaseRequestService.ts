import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IPurchaseFilterRequest,
  IPurchaseRequestModel,
  IPurchaseProcessRequestModel,
  IPurchaseStatusRequestModel,
  IPurchaseExchangeUpdateRequestModel,
  IPurchaseExchangeFilterRequestModel,
  IPurchaseCategoryFilterRequest,
} from "model/PurchaseRequest/PurchaseRequestModel";

export default {
  list: (params?: IPurchaseFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.purchaseRequest.list, params, signal);
  },
  listReport: (params?: IPurchaseFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.purchaseRequest.listReport, params, signal);
  },
  collect: (body: Record<string, unknown>, params?: Record<string, unknown>) => {
    return apiPost(`${urlsApi.purchaseRequest.collect}${convertParamsToString(params)}`, body);
  },
  statisticList: (params?: IPurchaseFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.purchaseRequest.statisticList, params, signal);
  },
  statisticStatus: (params?: IPurchaseFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.purchaseRequest.statisticStatus, params, signal);
  },
  statisticStatusByDate: (params?: IPurchaseFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.purchaseRequest.statisticStatusByDate, params, signal);
  },
  update: (body: IPurchaseRequestModel) => {
    return apiPost(urlsApi.purchaseRequest.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.purchaseRequest.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.purchaseRequest.delete}?id=${id}`);
  },
  purchaseRequestProcessUpdate: (body: IPurchaseProcessRequestModel, processCode?: string) => {
    const url = processCode
      ? `${urlsApi.purchaseRequest.purchaseRequestProcess}?processCode=${processCode}`
      : urlsApi.purchaseRequest.purchaseRequestProcess;

    return apiPost(url, body);
  },
  updateStatus: (body: IPurchaseStatusRequestModel) => {
    return apiPost(urlsApi.purchaseRequest.updateStatus, body);
  },

  resetTransferVotes: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.purchaseRequest.resetTransferVotes, params);
  },
  categoryList: (params?: IPurchaseCategoryFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.purchaseRequest.purchaseCategory, params, signal);
  },
  purchaseProduct: (params?: IPurchaseCategoryFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.purchaseRequest.purchaseProduct, params, signal);
  },
  paymentBill: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.purchaseRequest.paymentBill, params, signal);
  },
  contractInfo: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.purchaseRequest.contractInfo, params, signal);
  },
  renewalContract: (body: Record<string, unknown>, params?: Record<string, unknown>) => {
    return apiPost(`${urlsApi.purchaseRequest.renewalContract}${convertParamsToString(params)}`, body);
  },
  initReceiveTask: (body: Record<string, unknown>, params?: Record<string, unknown>) => {
    return apiPost(`${urlsApi.purchaseRequest.initReceiveTask}${convertParamsToString(params)}`, body);
  },
  updateCertificate: (body: Record<string, unknown>, params?: Record<string, unknown>) => {
    return apiPost(`${urlsApi.purchaseRequest.updateCertificate}${convertParamsToString(params)}`, body);
  },
  getJssdk: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.purchaseRequest.getJssdk, params, signal);
  },
  getProductJssdk: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.purchaseRequest.getProductJssdk, params, signal);
  },
};
