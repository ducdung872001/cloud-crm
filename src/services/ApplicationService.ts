import { apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.application.lst, params, signal);
  },
  listAll: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.application.lstAll, params, signal);
  },
  update: (body) => {
    return apiPost(`${urlsApi.application.update}`, body);
  },
  confirmBill: (body) => {
    return apiPost(`${urlsApi.application.confirmBill}`, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.application.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
