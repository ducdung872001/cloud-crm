import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IKpiApplyFilterRequest, IKpiApplyRequest } from "model/kpiApply/KpiApplyRequestModel";

export default {
  list: (params: IKpiApplyFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpiApply.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IKpiApplyRequest) => {
    return fetch(urlsApi.kpiApply.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.kpiApply.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
