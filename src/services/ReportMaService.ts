import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IAnalysisFilterRequest } from "model/analysis/AnalysisRequestModel";

export default {
  getCustomer: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportMa.getCustomer, params, signal);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.analysis.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
