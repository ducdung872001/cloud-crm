import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.businessRuleItem.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessRuleItem.update, body);
  },
  updateActive: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.businessRuleItem.updateActive, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.businessRuleItem.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.businessRuleItem.delete}?id=${id}`);
  },
};
