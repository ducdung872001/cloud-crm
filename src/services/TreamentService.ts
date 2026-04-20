import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import {
  ITreamentFilterByScheduler,
  ITreamentFilterRequest,
  ITreamentUpdateCaringEmployeeRequest,
  ITreamentUpdateNextRequest,
  ITreamentRequest,
} from "model/treatment/TreamentRequestModel";


export default {
  filter: (params: ITreamentFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.treatment.filterSchedule, params, signal);
  },
  filterByScheduler: (params: ITreamentFilterByScheduler, signal?: AbortSignal) => {
    return apiGet(urlsApi.treatment.filterByScheduler, params, signal);
  },
  updateNext: (body: ITreamentUpdateNextRequest) => {
    return apiPost(urlsApi.treatment.updateNext, body);
  },
  updateCaringEmployee: (body: ITreamentUpdateCaringEmployeeRequest) => {
    return apiPost(urlsApi.treatment.updateCaringEmployee, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.treatment.delete}?id=${id}`);
  },
  update: (body: ITreamentRequest) => {
    return apiPost(urlsApi.treatment.update, body);
  },
};
