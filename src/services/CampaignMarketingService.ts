import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaignMarketing.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  update: (body: any) => {
    return fetch(urlsApi.campaignMarketing.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  updateStatus: (body: any) => {
    return fetch(urlsApi.campaignMarketing.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  
  detail: (id: number) => {
    return fetch(`${urlsApi.campaignMarketing.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.campaignMarketing.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  //budget
  listMABudget: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.marketingBudget.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateMABudget: (body: any) => {
    return fetch(urlsApi.marketingBudget.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  updateMABudgetStatus: (body: any) => {
    return fetch(urlsApi.marketingBudget.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  
  detailMABudget: (id: number) => {
    return fetch(`${urlsApi.marketingBudget.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteMABudget: (id: number) => {
    return fetch(`${urlsApi.marketingBudget.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  //channel
  listMAChannel: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.marketingChannel.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateMAChannel: (body: any) => {
    return fetch(urlsApi.marketingChannel.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  
  detailMAChannel: (id: number) => {
    return fetch(`${urlsApi.marketingChannel.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteMAChannel: (id: number) => {
    return fetch(`${urlsApi.marketingChannel.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  //measurement
  listMAMeasurement: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.marketingMeasurement.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateMAMeasurement: (body: any) => {
    return fetch(urlsApi.marketingMeasurement.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  
  detailMAMeasurement: (id: number) => {
    return fetch(`${urlsApi.marketingMeasurement.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteMAMeasurement: (id: number) => {
    return fetch(`${urlsApi.marketingMeasurement.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  //report
  listMAReport: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.marketingReport.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateMAReport: (body: any) => {
    return fetch(urlsApi.marketingReport.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  
  detailMAReport: (id: number) => {
    return fetch(`${urlsApi.marketingReport.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  
  deleteMAReport: (id: number) => {
    return fetch(`${urlsApi.marketingReport.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },


};
