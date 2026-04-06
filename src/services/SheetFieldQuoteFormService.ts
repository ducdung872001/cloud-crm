import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  lst: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.sheetFieldQuoteForm.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.sheetFieldQuoteForm.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.sheetFieldQuoteForm.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.sheetFieldQuoteForm.delete}?id=${id}`);
  },
  updatePostion: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.sheetFieldQuoteForm.updatePosition, body);
  },
};
