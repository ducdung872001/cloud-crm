import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.feedback.lst, params, signal);
  },
  update: (body) => {
    return apiPost(urlsApi.feedback.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.feedback.delete}?id=${id}`);
  },
  changeStatus: (body) => {
    return apiPost(urlsApi.feedback.changeStatus, body);
  },
};
