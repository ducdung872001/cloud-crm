import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.bpmReason.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmReason.update, body);
  },
  updateActive: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmReason.updateActive, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.bpmReason.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.bpmReason.delete}?id=${id}`);
  },
};
