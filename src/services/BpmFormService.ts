import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.bpmForm.lst, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmForm.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.bpmForm.delete}?id=${id}`);
  },
};
