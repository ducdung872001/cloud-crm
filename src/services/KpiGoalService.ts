import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IKpiGoalFilterRequest, IKpiGoalRequest } from "model/kpiGoal/KpiGoalRequestModel";

export default {
  list: (params: IKpiGoalFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpiGoal.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IKpiGoalRequest) => {
    return fetch(urlsApi.kpiGoal.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.kpiGoal.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },  
  detail: (id: number) => {
    return fetch(`${urlsApi.kpiGoal.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
