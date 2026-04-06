import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.bpmField.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmField.update, body);
  },
  updateStatus: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmField.updateStatus, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.bpmField.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.bpmField.delete}?id=${id}`);
  },
};
