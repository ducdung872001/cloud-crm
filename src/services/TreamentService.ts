import { urlsApi } from "configs/urls";
import {
  ITreamentFilterByScheduler,
  ITreamentFilterRequest,
  ITreamentUpdateCaringEmployeeRequest,
  ITreamentUpdateNextRequest,
  ITreamentRequest,
} from "model/treatment/TreamentRequestModel";
import { convertParamsToString } from "reborn-util";

export default {
  filter: (params: ITreamentFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.treatment.filterSchedule}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  filterByScheduler: (params: ITreamentFilterByScheduler, signal?: AbortSignal) => {
    return fetch(`${urlsApi.treatment.filterByScheduler}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateNext: (body: ITreamentUpdateNextRequest) => {
    return fetch(urlsApi.treatment.updateNext, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateCaringEmployee: (body: ITreamentUpdateCaringEmployeeRequest) => {
    return fetch(urlsApi.treatment.updateCaringEmployee, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.treatment.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  update: (body: ITreamentRequest) => {
    return fetch(urlsApi.treatment.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
