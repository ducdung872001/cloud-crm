import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  lst: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.qrCode.list, params, signal);
  },
  update: (body) => {
    return apiPost(urlsApi.qrCode.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.qrCode.delete}?id=${id}`);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.qrCode.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
