import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.decisionTableOutput.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.decisionTableOutput.update, body);
  },
  updateActive: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.decisionTableOutput.updateActive, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.decisionTableOutput.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.decisionTableOutput.delete}?id=${id}`);
  },
};
