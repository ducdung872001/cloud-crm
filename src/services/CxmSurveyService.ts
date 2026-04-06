import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.cxmSurvey.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.cxmSurvey.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.cxmSurvey.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.cxmSurvey.delete}?id=${id}`);
  },
};
