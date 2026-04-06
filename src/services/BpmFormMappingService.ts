import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.bpmFormMapping.list, params, signal);
  },
  listSource: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.bpmFormMapping.listSource, params, signal);
  },
  listTarget: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.bpmFormMapping.listTarget, params, signal);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.bpmFormMapping.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmFormMapping.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.bpmFormMapping.delete}?id=${id}`);
  },
};
