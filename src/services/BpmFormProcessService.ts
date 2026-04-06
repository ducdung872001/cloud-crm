import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.bpmFormProcess.lst, params, signal);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.bpmFormProcess.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmFormProcess.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.bpmFormProcess.delete}?id=${id}`);
  },
};
