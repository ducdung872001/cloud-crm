import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.project.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.project.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.project.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.project.delete}?id=${id}`);
  },
  report: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.projectReport.report, params, signal);
  },
};
