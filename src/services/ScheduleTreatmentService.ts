import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IScheduleTreatmentFilterRequest, IScheduleTreatmentRequestModal } from "model/scheduleTreatment/ScheduleTreatmentRequestModel";

export default {
  list: (params?: IScheduleTreatmentFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.scheduleTreatment.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IScheduleTreatmentRequestModal) => {
    return fetch(urlsApi.scheduleTreatment.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.scheduleTreatment.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.scheduleTreatment.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
