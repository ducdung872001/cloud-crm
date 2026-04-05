import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.tenderPackage.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: Record<string, unknown>) => {
    return fetch(urlsApi.tenderPackage.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.tenderPackage.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.tenderPackage.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  listBiddingInvitation: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.tenderPackage.listBiddingInvitation}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  listContractor: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.tenderPackage.listContractor}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  detailBiddingInvitation: (id: number) => {
    return fetch(`${urlsApi.tenderPackage.detailBiddingInvitation}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  updateBidding: (body: Record<string, unknown>) => {
    return fetch(urlsApi.tenderPackage.updateBidding, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  cancelBidding: (body: Record<string, unknown>) => {
    return fetch(urlsApi.tenderPackage.cancelBidding, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  updateBiddingStatus: (body: Record<string, unknown>) => {
    return fetch(urlsApi.tenderPackage.updateBiddingStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Mở thầu 
  openBidding: (body: Record<string, unknown>) => {
    return fetch(urlsApi.tenderPackage.openBidding, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },


  //danh sách tài liệu nộp thầu
  listSubmittedDocument: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.tenderPackage.listSubmittedDocument}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //Đánh giá hồ sơ dự thầu
  updateBatch: (body: Record<string, unknown>) => {
    return fetch(urlsApi.tenderPackage.updateBatch, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  
  //Gửi đánh giá cho thư ký tổng hợp
  submitReview: (body: Record<string, unknown>) => {
    return fetch(urlsApi.tenderPackage.submitReview, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //tổng hợp kết quả đánh giá hồ sơ kỹ thuật trên màn hình thư ký 
  getResultDocumentEvaluation: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.tenderPackage.getResultDocumentEvaluation}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //tổng hợp kết quả đánh giá hồ sơ tài chính trên màn hình thư ký 
  getResultFinanceEvaluation: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.tenderPackage.getResultFinanceEvaluation}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //gửi phản hồi kết quả đánh giá
  sendEvaluation: (body: Record<string, unknown>) => {
    return fetch(urlsApi.tenderPackage.sendEvaluation, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  /// Gửi tổng hợp yêu cầu làm rõ
  updateGeneralClarification: (body: Record<string, unknown>) => {
    return fetch(urlsApi.tenderPackage.updateGeneralClarification, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  listGeneralClarification: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.tenderPackage.listGeneralClarification}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //gia hạn gói thầu
  extensionHistory: (body: Record<string, unknown>) => {
    return fetch(urlsApi.tenderPackage.extensionHistory, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  listExtensionHistory: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.tenderPackage.listExtensionHistory}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  detailExtensionRequest: (id: number) => {
    return fetch(`${urlsApi.tenderPackage.detailExtensionRequest}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  
};
