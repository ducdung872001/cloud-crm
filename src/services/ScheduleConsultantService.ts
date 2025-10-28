import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IScheduleConsultantFilterRequest, IScheduleConsultantRequestModelProps } from "model/scheduleConsultant/ScheduleConsultantRequestModel";

export default {
  list: (params?: IScheduleConsultantFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.scheduleConsultant.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IScheduleConsultantRequestModelProps) => {
    return fetch(urlsApi.scheduleConsultant.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.scheduleConsultant.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.scheduleConsultant.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
