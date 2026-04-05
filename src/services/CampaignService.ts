import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICampaignFilterRequest, ICampaignRequestModel } from "model/campaign/CampaignRequestModel";

export default {
  list: (params?: ICampaignFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listViewSale: (params?: ICampaignFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.listViewSale}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICampaignRequestModel) => {
    return fetch(urlsApi.campaign.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.campaign.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.campaign.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  listConvertRate: (id?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.convertRate}/${id}/summary`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateStatus: (body: Record<string, unknown>) => {
    return fetch(urlsApi.campaign.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  listActionScore: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.listActionScore}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //cài đặt điểm khách hàng
  updateStep3: (body: Record<string, unknown>) => {
    return fetch(urlsApi.campaign.updateStep3, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  
  listDataStep3: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.listDataStep3}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //cài đặt điểm nhân viên
  updateStep4: (body: Record<string, unknown>) => {
    return fetch(urlsApi.campaign.updateStep4, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  listDataScoreEmployee: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.listDataScoreEmployee}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  listSale: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.listSale}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  statisticApproach: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.statisticApproach}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  statisticSale: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.statisticSale}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  statisticConvertRate: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.statisticConvertRate}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  exportResult: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.exportResult}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },

  exportAction: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.exportAction}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },

  exportCustomer: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.exportCustomer}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },

  updateConfigSLA: (body: Record<string, unknown>) => {
    return fetch(urlsApi.campaign.updateConfigSLA, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
