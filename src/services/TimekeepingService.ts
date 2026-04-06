import { apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { ITimekeepingFilterRequest, ITimekeepingRequest } from "model/timekeeping/TimekeepingRequestModel";


export default {
  list: (params: ITimekeepingFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.timekeeping.list, params, signal);
  },
  update: (body: ITimekeepingRequest) => {
    return apiPost(urlsApi.timekeeping.update, body);
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.timekeeping.delete}?id=${id}`, {
      method: "POST",
    }).then((res) => res.json());
  },
};
