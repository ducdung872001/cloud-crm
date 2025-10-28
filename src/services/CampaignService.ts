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

  listConvertRate: (id?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.convertRate}/${id}/summary`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateStatus: (body: any) => {
    return fetch(urlsApi.campaign.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  listActionScore: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.listActionScore}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //cài đặt điểm khách hàng
  updateStep3: (body: any) => {
    return fetch(urlsApi.campaign.updateStep3, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  
  listDataStep3: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.listDataStep3}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //cài đặt điểm nhân viên
  updateStep4: (body: any) => {
    return fetch(urlsApi.campaign.updateStep4, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  listDataScoreEmployee: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.listDataScoreEmployee}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  listSale: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.listSale}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  statisticApproach: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.statisticApproach}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  statisticSale: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.statisticSale}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  statisticConvertRate: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.statisticConvertRate}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  exportResult: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.exportResult}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },

  exportAction: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.exportAction}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },

  exportCustomer: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.exportCustomer}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },

  updateConfigSLA: (body: any) => {
    return fetch(urlsApi.campaign.updateConfigSLA, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
