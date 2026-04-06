import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.formCategory.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.formCategory.update, body);
  },
  // detail: (id: number) => {
  //   return fetch(`${urlsApi.formCategory.detail}?id=${id}`, {
  //     method: "GET",
  //   }).then((res) => res.json());
  // },
  detail: (code: string) => {
    return fetch(`${urlsApi.formCategory.detail}?code=${code}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.formCategory.delete}?id=${id}`);
  },
};
