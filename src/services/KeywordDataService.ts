import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IKeyWordDataFilterResquest, IKeyWordDataResquest } from "model/keywordData/KeywordDataRequest";

export default {
  list: (params: IKeyWordDataFilterResquest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.keywordData.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IKeyWordDataResquest) => {
    return fetch(urlsApi.keywordData.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.keywordData.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.keywordData.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
