import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IAnalysisFilterRequest } from "model/analysis/AnalysisRequestModel";

export default {
  getCustomer: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportMa.getCustomer}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.analysis.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
