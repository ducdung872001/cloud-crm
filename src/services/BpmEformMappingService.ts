import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  listSource: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.bpmEformMapping.lstSource, params, signal);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.bpmEformMapping.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmEformMapping.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.bpmEformMapping.delete}?id=${id}`);
  },

  listEform: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.bpmEformMapping.lstEform, params, signal);
  },
};
