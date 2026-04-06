import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  lst: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.sheetQuoteForm.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.sheetQuoteForm.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.sheetQuoteForm.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.sheetQuoteForm.delete}?id=${id}`);
  },
};
