import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IWorkTypeFilterRequest, IWorkTypeRequest } from "model/workType/WorkTypeRequestModel";

export default {
  list: (params: IWorkTypeFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.workType.list, params, signal);
  },
  update: (body: IWorkTypeRequest) => {
    return apiPost(urlsApi.workType.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.workType.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.workType.delete}?id=${id}`);
  },
};
