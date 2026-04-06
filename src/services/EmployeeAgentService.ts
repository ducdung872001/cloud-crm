import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.employeeAgent.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.employeeAgent.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.employeeAgent.delete}?id=${id}`);
  },

  listAthena: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.employeeAgent.listAthena, params, signal);
  },
};
