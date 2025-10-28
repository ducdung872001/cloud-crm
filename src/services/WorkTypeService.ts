import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IWorkTypeFilterRequest, IWorkTypeRequest } from "model/workType/WorkTypeRequestModel";

export default {
  list: (params: IWorkTypeFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.workType.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IWorkTypeRequest) => {
    return fetch(urlsApi.workType.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.workType.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.workType.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
