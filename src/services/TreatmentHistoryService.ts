import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import {
  ITreatmentHistoryFilterRequest,
  ITreatmentHistoryListByCustomerFilterRequest,
  ITreatmentHistoryRequestModel,
} from "model/treatmentHistory/TreatmentHistoryRequestModel";

export default {
  list: (params: ITreatmentHistoryFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.treatmentHistory.list, params, signal);
  },
  listByCustomer: (params: ITreatmentHistoryListByCustomerFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.treatmentHistory.listByCustomer, params, signal);
  },
  update: (body: ITreatmentHistoryRequestModel[]) => {
    return apiPost(urlsApi.treatmentHistory.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.treatmentHistory.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.treatmentHistory.delete}?id=${id}`);
  },
};
