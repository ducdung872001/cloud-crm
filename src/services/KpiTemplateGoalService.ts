import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IKpiTemplateGoalFilterRequest, IKpiTemplateGoalRequest } from "model/kpiTemplateGoal/KpiTemplateGoalRequestModel";

export default {
  list: (params: IKpiTemplateGoalFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpiTemplateGoal.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IKpiTemplateGoalRequest) => {
    return fetch(urlsApi.kpiTemplateGoal.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.kpiTemplateGoal.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
