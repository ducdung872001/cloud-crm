import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICampaignApproachFilterRequest, ICampaignApproachRequestModel } from "model/campaignApproach/CampaignApproachRequestModel";

export default {
  list: (params?: ICampaignApproachFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaignApproach.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICampaignApproachRequestModel) => {
    return fetch(urlsApi.campaignApproach.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.campaignApproach.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.campaignApproach.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  updateSLA: (body: any) => {
    return fetch(urlsApi.campaignApproach.updateSLA, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  activityList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaignApproach.activityList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateActivity: (body: any) => {
    return fetch(urlsApi.campaignApproach.updateActivity, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteActivity: (id: number) => {
    return fetch(`${urlsApi.campaignApproach.deleteActivity}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
