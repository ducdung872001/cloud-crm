import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?, signal?: AbortSignal) => {
    return apiGet(urlsApi.objectFeature.lst, params, signal);
  },
  update: (body) => {
    return apiPost(urlsApi.objectFeature.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.objectFeature.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.objectFeature.delete}?id=${id}`);
  },
};
