import { urlsApi } from "configs/urls";
import { ITimekeepingFilterRequest, ITimekeepingRequest } from "model/timekeeping/TimekeepingRequestModel";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: ITimekeepingFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.timekeeping.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ITimekeepingRequest) => {
    return fetch(urlsApi.timekeeping.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.timekeeping.delete}?id=${id}`, {
      method: "POST",
    }).then((res) => res.json());
  },
};
