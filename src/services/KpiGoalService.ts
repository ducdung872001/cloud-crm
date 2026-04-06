import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IKpiGoalFilterRequest, IKpiGoalRequest } from "model/kpiGoal/KpiGoalRequestModel";

export default {
  list: (params: IKpiGoalFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.kpiGoal.list, params, signal);
  },
  update: (body: IKpiGoalRequest) => {
    return apiPost(urlsApi.kpiGoal.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.kpiGoal.delete}?id=${id}`);
  },  
  detail: (id: number) => {
    return fetch(`${urlsApi.kpiGoal.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
