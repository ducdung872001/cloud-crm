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
    return fetch(`${urlsApi.purchaseRequest.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listReport: (params?: IPurchaseFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.purchaseRequest.listReport}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  collect: (body: any, params?: any) => {
    return fetch(`${urlsApi.purchaseRequest.collect}${convertParamsToString(params)}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  statisticList: (params?: IPurchaseFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.purchaseRequest.statisticList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  statisticStatus: (params?: IPurchaseFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.purchaseRequest.statisticStatus}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  statisticStatusByDate: (params?: IPurchaseFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.purchaseRequest.statisticStatusByDate}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IPurchaseRequestModel) => {
    return fetch(urlsApi.purchaseRequest.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.purchaseRequest.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.purchaseRequest.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  purchaseRequestProcessUpdate: (body: IPurchaseProcessRequestModel, processCode?: string) => {
    const url = processCode
      ? `${urlsApi.purchaseRequest.purchaseRequestProcess}?processCode=${processCode}`
      : urlsApi.purchaseRequest.purchaseRequestProcess;

    return fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateStatus: (body: IPurchaseStatusRequestModel) => {
    return fetch(urlsApi.purchaseRequest.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  resetTransferVotes: (params: any) => {
    return fetch(`${urlsApi.purchaseRequest.resetTransferVotes}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  categoryList: (params?: IPurchaseCategoryFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.purchaseRequest.purchaseCategory}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  purchaseProduct: (params?: IPurchaseCategoryFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.purchaseRequest.purchaseProduct}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  paymentBill: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.purchaseRequest.paymentBill}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  contractInfo: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.purchaseRequest.contractInfo}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  renewalContract: (body: any, params?: any) => {
    return fetch(`${urlsApi.purchaseRequest.renewalContract}${convertParamsToString(params)}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  initReceiveTask: (body: any, params?: any) => {
    return fetch(`${urlsApi.purchaseRequest.initReceiveTask}${convertParamsToString(params)}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateCertificate: (body: any, params?: any) => {
    return fetch(`${urlsApi.purchaseRequest.updateCertificate}${convertParamsToString(params)}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  getJssdk: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.purchaseRequest.getJssdk}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  getProductJssdk: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.purchaseRequest.getProductJssdk}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
