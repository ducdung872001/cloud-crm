import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.notificationHistory.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.notificationHistory.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.notificationHistory.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.notificationHistory.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  updateUnread: (body: any) => {
    return fetch(urlsApi.notificationHistory.updateUnread, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  updateReadAll: (body: any) => {
    return fetch(urlsApi.notificationHistory.updateReadAll, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  countUnread: () => {
    return fetch(`${urlsApi.notificationHistory.countUnread}`, {
      method: "GET",
    }).then((res) => res.json());
  },

};
