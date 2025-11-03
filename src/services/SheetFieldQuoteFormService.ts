import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  lst: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.sheetFieldQuoteForm.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.sheetFieldQuoteForm.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.sheetFieldQuoteForm.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.sheetFieldQuoteForm.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  updatePostion: (body: any) => {
    return fetch(urlsApi.sheetFieldQuoteForm.updatePosition, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
