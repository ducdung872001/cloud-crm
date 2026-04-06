import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IKeyWordDataFilterResquest, IKeyWordDataResquest } from "model/keywordData/KeywordDataRequest";

export default {
  list: (params: IKeyWordDataFilterResquest, signal?: AbortSignal) => {
    return apiGet(urlsApi.keywordData.list, params, signal);
  },
  update: (body: IKeyWordDataResquest) => {
    return apiPost(urlsApi.keywordData.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.keywordData.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.keywordData.delete}?id=${id}`);
  },
};
