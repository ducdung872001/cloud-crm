import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IAnalysisFilterRequest } from "model/analysis/AnalysisRequestModel";

export default {
  reportContractWarranty: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportContractWarranty.statistical}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
