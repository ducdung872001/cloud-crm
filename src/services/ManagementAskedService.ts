import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.managementAsked.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.managementAsked.update, body);
  },

  detail: (id: number) => {
    return fetch(`${urlsApi.managementAsked.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.managementAsked.delete}?id=${id}`);
  },

  replyAsked: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.managementAsked.replyAsked, body);
  },

  getClarificationDetail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.clarificationDetail.list, params, signal);
  },

  assignRequest: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.managementAsked.assignRequest, body);
  },

  detailClarification: (id: number) => {
    return fetch(`${urlsApi.clarificationDetail.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  updateStatusClarification: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.clarificationDetail.updateStatus, body);
  },

  saveReply: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.managementAsked.saveReply, body);
  },

  getDetailReply: (id: number) => {
    return fetch(`${urlsApi.managementAsked.getDetailReply}?detailId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  getRepsonseList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.managementAsked.getRepsonseList, params, signal);
  },

  insertRepsonse: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.managementAsked.insertRepsonse, body);
  },

};
