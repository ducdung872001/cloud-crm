import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ICampaignApproachFilterRequest, ICampaignApproachRequestModel } from "model/campaignApproach/CampaignApproachRequestModel";

export default {
  list: (params?: ICampaignApproachFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaignApproach.list, params, signal);
  },
  update: (body: ICampaignApproachRequestModel) => {
    return apiPost(urlsApi.campaignApproach.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.campaignApproach.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.campaignApproach.delete}?id=${id}`);
  },
  updateSLA: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.campaignApproach.updateSLA, body);
  },

  activityList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaignApproach.activityList, params, signal);
  },

  updateActivity: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.campaignApproach.updateActivity, body);
  },
  deleteActivity: (id: number) => {
    return apiDelete(`${urlsApi.campaignApproach.deleteActivity}?id=${id}`);
  },
};
