import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  ITreatmentHistoryFilterRequest,
  ITreatmentHistoryListByCustomerFilterRequest,
  ITreatmentHistoryRequestModel,
} from "model/treatmentHistory/TreatmentHistoryRequestModel";

export default {
  list: (params: ITreatmentHistoryFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.treatmentHistory.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listByCustomer: (params: ITreatmentHistoryListByCustomerFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.treatmentHistory.listByCustomer}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ITreatmentHistoryRequestModel[]) => {
    return fetch(urlsApi.treatmentHistory.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.treatmentHistory.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.treatmentHistory.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
