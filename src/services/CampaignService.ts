import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICampaignFilterRequest, ICampaignRequestModel } from "model/campaign/CampaignRequestModel";

export default {
  list: (params?: ICampaignFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaign.list, params, signal);
  },
  listViewSale: (params?: ICampaignFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaign.listViewSale, params, signal);
  },
  update: (body: ICampaignRequestModel) => {
    return apiPost(urlsApi.campaign.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.campaign.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.campaign.delete}?id=${id}`);
  },

  listConvertRate: (id?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaign.convertRate}/${id}/summary`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateStatus: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.campaign.updateStatus, body);
  },

  listActionScore: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaign.listActionScore, params, signal);
  },

  //cài đặt điểm khách hàng
  updateStep3: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.campaign.updateStep3, body);
  },

  
  listDataStep3: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaign.listDataStep3, params, signal);
  },

  //cài đặt điểm nhân viên
  updateStep4: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.campaign.updateStep4, body);
  },

  listDataScoreEmployee: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaign.listDataScoreEmployee, params, signal);
  },

  listSale: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaign.listSale, params, signal);
  },

  statisticApproach: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaign.statisticApproach, params, signal);
  },

  statisticSale: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaign.statisticSale, params, signal);
  },

  statisticConvertRate: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaign.statisticConvertRate, params, signal);
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
    return apiPost(urlsApi.campaign.updateConfigSLA, body);
  },
};
