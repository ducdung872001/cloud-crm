import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.managementAsked.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: Record<string, unknown>) => {
    return fetch(urlsApi.managementAsked.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detail: (id: number) => {
    return fetch(`${urlsApi.managementAsked.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.managementAsked.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  replyAsked: (body: Record<string, unknown>) => {
    return fetch(urlsApi.managementAsked.replyAsked, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  getClarificationDetail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.clarificationDetail.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  assignRequest: (body: Record<string, unknown>) => {
    return fetch(urlsApi.managementAsked.assignRequest, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detailClarification: (id: number) => {
    return fetch(`${urlsApi.clarificationDetail.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  updateStatusClarification: (body: Record<string, unknown>) => {
    return fetch(urlsApi.clarificationDetail.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  saveReply: (body: Record<string, unknown>) => {
    return fetch(urlsApi.managementAsked.saveReply, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  getDetailReply: (id: number) => {
    return fetch(`${urlsApi.managementAsked.getDetailReply}?detailId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  getRepsonseList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.managementAsked.getRepsonseList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  insertRepsonse: (body: Record<string, unknown>) => {
    return fetch(urlsApi.managementAsked.insertRepsonse, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

};
