import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IScheduleTreatmentFilterRequest, IScheduleTreatmentRequestModal } from "model/scheduleTreatment/ScheduleTreatmentRequestModel";
import update from "lodash/update";

export default {
  list: (params?: IScheduleTreatmentFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.scheduleTreatment.list, params, signal);
  },
  update: (body: IScheduleTreatmentRequestModal) => {
    return apiPost(urlsApi.scheduleTreatment.update, body);
  },
  updateKafka: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.scheduleTreatment.updateKafka, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.scheduleTreatment.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.scheduleTreatment.delete}?id=${id}`);
  },
};
