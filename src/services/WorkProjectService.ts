import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IWorkProjectFilterRequest, IWorkProjectRequestModel } from "model/workProject/WorkProjectRequestModel";

export default {
  list: (params: IWorkProjectFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.workProject.list, params, signal);
  },
  update: (body: IWorkProjectRequestModel) => {
    return apiPost(urlsApi.workProject.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.workProject.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.workProject.delete}?id=${id}`);
  },
};
