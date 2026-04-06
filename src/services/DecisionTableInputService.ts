import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.decisionTableInput.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.decisionTableInput.update, body);
  },
  updateActive: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.decisionTableInput.updateActive, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.decisionTableInput.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.decisionTableInput.delete}?id=${id}`);
  },
};
