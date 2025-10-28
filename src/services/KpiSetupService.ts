import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IKpiSetupFilterRequest, IKpiSetupRequest } from "model/kpiSetup/KpiSetupRequestModel";

export default {
  list: (params: IKpiSetupFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpiSetup.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IKpiSetupRequest) => {
    return fetch(urlsApi.kpiSetup.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.kpiSetup.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
