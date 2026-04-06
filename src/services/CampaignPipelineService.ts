import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaignPipeline.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.campaignPipeline.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.campaignPipeline.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.campaignPipeline.delete}?id=${id}`);
  },
};
