import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IWorkProjectFilterRequest, IWorkProjectRequestModel } from "model/workProject/WorkProjectRequestModel";

export default {
  list: (params: IWorkProjectFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.workProject.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IWorkProjectRequestModel) => {
    return fetch(urlsApi.workProject.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.workProject.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.workProject.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
