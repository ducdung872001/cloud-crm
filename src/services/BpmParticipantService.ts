import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.bpmParticipant.lst, params, signal);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.bpmParticipant.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmParticipant.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.bpmParticipant.delete}?id=${id}`);
  },
};
