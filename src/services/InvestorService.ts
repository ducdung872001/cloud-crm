import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.bpmInvestor.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmInvestor.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.bpmInvestor.delete}?id=${id}`);
  },
  updateStatus: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmInvestor.updateStatus, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.bpmInvestor.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
