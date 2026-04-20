import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.tenderPackage.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.tenderPackage.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.tenderPackage.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.tenderPackage.delete}?id=${id}`);
  },

  listBiddingInvitation: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.tenderPackage.listBiddingInvitation, params, signal);
  },

  listContractor: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.tenderPackage.listContractor, params, signal);
  },

  detailBiddingInvitation: (id: number) => {
    return fetch(`${urlsApi.tenderPackage.detailBiddingInvitation}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  updateBidding: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.tenderPackage.updateBidding, body);
  },

  cancelBidding: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.tenderPackage.cancelBidding, body);
  },

  updateBiddingStatus: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.tenderPackage.updateBiddingStatus, body);
  },

  //Mở thầu 
  openBidding: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.tenderPackage.openBidding, body);
  },


  //danh sách tài liệu nộp thầu
  listSubmittedDocument: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.tenderPackage.listSubmittedDocument, params, signal);
  },

  //Đánh giá hồ sơ dự thầu
  updateBatch: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.tenderPackage.updateBatch, body);
  },
  
  //Gửi đánh giá cho thư ký tổng hợp
  submitReview: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.tenderPackage.submitReview, body);
  },

  //tổng hợp kết quả đánh giá hồ sơ kỹ thuật trên màn hình thư ký 
  getResultDocumentEvaluation: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.tenderPackage.getResultDocumentEvaluation, params, signal);
  },

  //tổng hợp kết quả đánh giá hồ sơ tài chính trên màn hình thư ký 
  getResultFinanceEvaluation: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.tenderPackage.getResultFinanceEvaluation, params, signal);
  },

  //gửi phản hồi kết quả đánh giá
  sendEvaluation: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.tenderPackage.sendEvaluation, body);
  },

  /// Gửi tổng hợp yêu cầu làm rõ
  updateGeneralClarification: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.tenderPackage.updateGeneralClarification, body);
  },

  listGeneralClarification: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.tenderPackage.listGeneralClarification, params, signal);
  },

  //gia hạn gói thầu
  extensionHistory: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.tenderPackage.extensionHistory, body);
  },

  listExtensionHistory: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.tenderPackage.listExtensionHistory, params, signal);
  },

  detailExtensionRequest: (id: number) => {
    return fetch(`${urlsApi.tenderPackage.detailExtensionRequest}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  
};
