import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IScheduleConsultantFilterRequest, IScheduleConsultantRequestModelProps } from "model/scheduleConsultant/ScheduleConsultantRequestModel";

export default {
  list: (params?: IScheduleConsultantFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.scheduleConsultant.list, params, signal);
  },
  update: (body: IScheduleConsultantRequestModelProps) => {
    return apiPost(urlsApi.scheduleConsultant.update, body);
  },
  updateKafka: (body: IScheduleConsultantRequestModelProps) => {
    return apiPost(urlsApi.scheduleConsultant.updateKafka, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.scheduleConsultant.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.scheduleConsultant.delete}?id=${id}`);
  },
};
