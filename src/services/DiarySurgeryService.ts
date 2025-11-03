import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IDiarySurgeryFilterRequest, IDiarySurgeryRequestModel } from "model/diarySurgery/DiarySurgeryRequestModel";

export default {
  list: (params: IDiarySurgeryFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.diarySurgery.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IDiarySurgeryRequestModel) => {
    return fetch(urlsApi.diarySurgery.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.diarySurgery.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.diarySurgery.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
