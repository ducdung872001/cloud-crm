import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.notificationHistory.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.notificationHistory.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.notificationHistory.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.notificationHistory.delete}?id=${id}`);
  },

  updateUnread: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.notificationHistory.updateUnread, body);
  },

  updateReadAll: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.notificationHistory.updateReadAll, body);
  },

  countUnread: () => {
    return fetch(`${urlsApi.notificationHistory.countUnread}`, {
      method: "GET",
    }).then((res) => res.json());
  },

};
