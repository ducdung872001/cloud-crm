import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractApproach.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.contractApproach.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contractApproach.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contractApproach.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  activityList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractApproach.activityList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateActivity: (body: any) => {
    return fetch(urlsApi.contractApproach.updateActivity, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteActivity: (id: number) => {
    return fetch(`${urlsApi.contractApproach.deleteActivity}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
